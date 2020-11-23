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

    async query(statement) {
        const query = util.promisify(this.connection.query).bind(this.connection);

        try {
            return await query(statement);
        } catch (error) {
            console.error(error);
        }

        return null;
    }

    async tableExists(tableName) {}

    async columnExists(tableName, columnName) {}

    async insert(tableName, mappings) {}

    async update(id, keyColumn, tableName, mappings) {}

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
                filter += " and ";
            }

            filter += "#val" + vals.toString() + " " + queryData.filter[i].operator + " :val" + vals.toString();
            attributes["#val" + vals.toString()] = queryData.filter[i].column;
            attributesValues[":val" + vals.toString()] = queryData.filter[i].value;
            vals++;
        }

        const params = {
            TableName: queryData.table,
            FilterExpression: filter,
            ExpressionAttributeNames: attributes,
            ExpressionAttributeValues: attributesValues,
        };

        let data = null;
        try {
            data = await this.dynamodb.scan(params).promise();
        } catch (error) {
            throw new Error(error);
        }

        if (type === "first") {
            return data && data.Items && data.Items.length > 0 && data.Items[0] ? data.Items[0] : null;
        }
        return data && data.Items && data.Items.length > 0 ? data.Items : null;
    }
}

module.exports = DynamoDBDriver;