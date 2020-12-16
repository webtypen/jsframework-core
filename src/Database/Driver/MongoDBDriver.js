"use strict";
const AWS = require("aws-sdk");
const moment = require("moment");
const util = require("util");
const mongo = require("mongodb");
const BaseDriver = require("./BaseDriver");

class MongoDBDriver extends BaseDriver {
    static name = "dynamodb";

    credentials = null;
    client = null;
    dbo = null;
    database = null;

    async connect() {
        return await new Promise(async (resolve) => {
            const url = "mongodb://" + this.config.host + ":" + this.config.port + "/";
            this.client = mongo.MongoClient;

            this.client.connect(url, { useUnifiedTopology: true }, (err, db) => {
                if (err) throw err;

                this.database = db;
                this.dbo = this.database.db(this.config.database);
                if (!this.database) {
                    throw new Error("Unknown error connecting to mongo-db `" + this.config.database + "`");
                }
                resolve(true);
            });
        });
    }

    async close() {
        if (this.database) {
            this.database.close();
        }
    }

    async createTable(tableName, migrationTable) {}

    async tableExists(tableName) {}

    async columnExists(tableName, columnName) {}

    async insert(tableName, mappings) {
        return await new Promise(async (resolve) => {
            this.dbo.collection(tableName).insertOne(mappings, (err, res) => {
                if (err) {
                    throw err;
                }

                resolve(
                    res && res.insertedId && res.insertedId instanceof mongo.ObjectID
                        ? { primaryKey: res.insertedId.toString() }
                        : true
                );
            });
        });
    }

    async update(id, keyColumn, tableName, mappings) {
        if (mappings[keyColumn]) {
            delete mappings[keyColumn];
        }

        return await new Promise(async (resolve) => {
            this.dbo.collection(tableName).updateOne({ [keyColumn]: id }, { $set: mappings }, (err, res) => {
                if (err) {
                    throw err;
                }

                resolve(true);
            });
        });
    }

    async queryBuilder(type, queryData) {
        return await new Promise(async (resolve) => {
            let filter = {};
            let currentFilter = [];
            let currentFilterType = null;
            for (let i in queryData.filter) {
                const value =
                    queryData.filter[i].column === "_id"
                        ? new mongo.ObjectID(queryData.filter[i].value)
                        : queryData.filter[i].value;

                if (queryData.filter[i].filterType === "where") {
                    currentFilter.push({
                        [queryData.filter[i].column]: value,
                    });
                } else if (queryData.filter[i].filterType === "orWhere") {
                    if (currentFilter && currentFilter.length > 0) {
                        if (!filter.$or) {
                            filter.$or = [];
                        }

                        let orFilter = {};
                        for (let i in currentFilter) {
                            const key = Object.keys(currentFilter[i])[0];
                            orFilter[key] = currentFilter[i][key];
                        }
                        filter.$or.push(orFilter);
                        currentFilter = [];
                        currentFilterType = "or";
                    }

                    currentFilter.push({
                        [queryData.filter[i].column]: value,
                    });
                }
            }

            if (currentFilter && currentFilter.length > 0) {
                if (Object.keys(filter).length < 1) {
                    for (let i in currentFilter) {
                        const key = Object.keys(currentFilter[i])[0];
                        filter[key] = currentFilter[i][key];
                    }
                } else {
                    if (filter.$or && currentFilterType === "or") {
                        let orFilter = {};
                        for (let i in currentFilter) {
                            const key = Object.keys(currentFilter[i])[0];
                            orFilter[key] = currentFilter[i][key];
                        }
                        filter.$or.push(orFilter);
                    }
                }
            }

            // Sortierung anwenden
            let orderBy = null;
            if (queryData.orderBy && queryData.orderBy.length > 0) {
                for (let i in queryData.orderBy) {
                    if (!queryData.orderBy[i] || !queryData.orderBy[i].column || !queryData.orderBy[i].order) {
                        continue;
                    }

                    if (orderBy === null) {
                        orderBy = {};
                    }

                    orderBy[queryData.orderBy[i].column] =
                        queryData.orderBy[i].order.trim().toUpperCase() === "DESC" ? -1 : 1;
                }
            }

            if (type === "count") {
                this.dbo
                    .collection(queryData.table)
                    .find(filter)
                    .count(function (err, data) {
                        if (err) {
                            throw err;
                        }

                        resolve(data);
                    });
            } else if (type === "first") {
                if (orderBy === null) {
                    this.dbo.collection(queryData.table).findOne(filter, (err, data) => {
                        if (err) {
                            throw err;
                        }

                        resolve(data ? data : null);
                    });
                } else {
                    this.dbo
                        .collection(queryData.table)
                        .find(filter)
                        .sort(orderBy)
                        .limit(1)
                        .toArray(function (err, data) {
                            if (err) {
                                throw err;
                            }

                            resolve(data && data.length > 0 ? data[0] : null);
                        });
                }
            } else {
                this.dbo
                    .collection(queryData.table)
                    .find(filter)
                    .sort(orderBy)
                    .toArray(function (err, data) {
                        if (err) {
                            throw err;
                        }

                        resolve(data && data.length > 0 ? data : null);
                    });
            }
        });
    }
}

module.exports = MongoDBDriver;
