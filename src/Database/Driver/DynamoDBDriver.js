"use strict";
const AWS = require("aws-sdk");
const moment = require("moment");
const util = require("util");
const BaseDriver = require("./BaseDriver");

class DynamoDBDriver extends BaseDriver {
    static name = "dynamodb";

    tableCache = {};
    credentials = null;
    dynamodb = null;

    columnMappings = {
        string: { type: "VARCHAR", defaultLength: 255 },
        text: { type: "TEXT" },
        longtext: { type: "TEXT" },
        integer: { type: "INT" },
        boolean: { type: "BOOL" },
        date: { type: "DATE" },
        datetime: { type: "DATETIME" },
    };

    async connect() {
        return await new Promise(async (resolve) => {
            const credentials = await new Promise((resolve) => {
                AWS.config.getCredentials((err) => {
                    if (err) {
                        console.log(err);
                        throw new Error("There was an error connecting to dynamodb");
                    }

                    resolve(AWS.config.credentials);
                });
            });

            if (!credentials || !credentials.accessKeyId || credentials.accessKeyId.trim() === "") {
                throw new Error("There was an error connecting to dynamodb");
            }

            this.credentials = credentials;
            this.dynamodb = new AWS.DynamoDB.DocumentClient({
                region: process.env.AWS_REGION,
            });
            resolve(true);
        });
    }

    async close() {}

    async createTable(tableName, migrationTable) {}

    async tableExists(tableName) {}

    async columnExists(tableName, columnName) {}

    async insert(tableName, mappings) {
        const params = {
            TableName: tableName,
            Item: mappings,
        };
        await this.dynamodb.put(params).promise();
        return true;
    }

    async update(id, keyColumn, tableName, mappings) {
        const params = {
            TableName: tableName,
            Item: mappings,
        };
        await this.dynamodb.put(params).promise();
        return true;
    }

    handleInsertValue(value) {
        if (typeof value === "object" && value instanceof moment) {
            value = value.format("YYYY-MM-DD hh:mm:ss");
        }
        return value;
    }

    async queryBuilder(type, queryData) {
        let vals = 0;
        let filter = "";
        let attributes = {};
        let attributesValues = {};
        for (let i in queryData.filter) {
            if (filter.trim() !== "") {
                if (queryData.filter[i].filterType === "orWhere") {
                    filter += " or ";
                } else {
                    filter += " and ";
                }
            }

            filter += "#val" + vals.toString() + " " + queryData.filter[i].operator + " :val" + vals.toString();
            attributes["#val" + vals.toString()] = queryData.filter[i].column;
            attributesValues[":val" + vals.toString()] = queryData.filter[i].value;
            vals++;
        }

        let params = {
            TableName: queryData.table,
        };

        if (filter && filter.trim() !== "") {
            params.FilterExpression = filter;
        }

        if (queryData.select && queryData.select.length > 0) {
            const select = [];
            for (let i in queryData.select) {
                select.push("#select" + i);
                attributes["#select" + i] = queryData.select[i];
            }
            params.ProjectionExpression = select;
        }

        if (vals > 0) {
            params.ExpressionAttributeNames = attributes;
            params.ExpressionAttributeValues = attributesValues;
        }

        if (type === "delete") {
            const data = await this.dynamodb.scan(params).promise();
            let remove;
            if (data && data.Items && data.Items.length > 0) {
                for (let i in data.Items) {
                    if (
                        queryData.modelMapping &&
                        queryData.modelMapping.sortKey &&
                        queryData.modelMapping.sortKeyColumn
                    ) {
                        const deleteParams = {
                            TableName: queryData.table,
                            Key: {
                                [queryData.modelMapping.keyColumn]: data.Items[i][queryData.modelMapping.keyColumn],
                                [queryData.modelMapping.sortKeyColumn]: queryData.modelMapping.sortKey,
                            },
                        };

                        remove = await this.dynamodb.delete(deleteParams).promise();
                    } else {
                        remove = this.dynamodb
                            .delete({
                                TableName: queryData.table,
                                Key: data.Items[i],
                            })
                            .promise();
                    }
                }
            }
            return remove;
        }

        let data = null;
        try {
            data = await this.dynamodb.scan(params).promise();
        } catch (error) {
            console.error(error);
            throw new Error(error);
        }

        if (type === "first") {
            return data && data.Items && data.Items.length > 0 && data.Items[0] ? data.Items[0] : null;
        }
        return data && data.Items && data.Items.length > 0 ? data.Items : null;
    }
}

module.exports = DynamoDBDriver;
