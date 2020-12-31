"use strict";
const Config = require("../Config");
const Connections = require("./Connections");
const moment = require("moment");

class QueryBuilder {
    connection = null;
    modelMapping = null;
    queryData = {
        table: null,
        filter: [],
        orderBy: [],
        limit: null,
        offset: null,
    };

    constructor(connection) {
        this.connection = connection ? connection : Config.get("database.default");
    }

    setModelMapping(model) {
        this.modelMapping = model;
        return this;
    }

    table(table) {
        this.queryData.table = table;
        return this;
    }

    where(column, operator, value) {
        this.queryData.filter.push({
            filterType: "where",
            column: column,
            operator: operator,
            value: value,
        });
        return this;
    }

    whereIn(column, array) {
        this.queryData.filter.push({
            filterType: "whereIn",
            column: column,
            value: array,
        });
        return this;
    }

    orWhere(column, operator, value) {
        this.queryData.filter.push({
            filterType: "orWhere",
            column: column,
            operator: operator,
            value: value,
        });
        return this;
    }

    orderBy(column, order) {
        this.queryData.orderBy.push({
            column: column,
            order: order,
        });
        return this;
    }

    take(amount, offset) {
        this.queryData.limit = amount;

        if (offset !== undefined) {
            this.queryData.offset = offset;
        }
        return this;
    }

    offset(offset) {
        this.queryData.offset = offset;
        return this;
    }

    async first() {
        let data = null;
        try {
            const connection = await Connections.getConnection(this.connection);
            data = await connection.queryBuilder("first", this.queryData);
            if (!this.modelMapping) {
                return data;
            }
        } catch (e) {
            console.error(e);
            throw new Error(e);
        }

        return this.handleModelMapping(data);
    }

    async get() {
        let data = null;
        try {
            const connection = await Connections.getConnection(this.connection);
            data = await connection.queryBuilder("get", this.queryData);
        } catch (e) {
            console.error(e);
            throw new Error(e);
        }
        if (!this.modelMapping) {
            return data;
        }

        return data && data.length > 0 ? data.map((el) => this.handleModelMapping(el)) : null;
    }

    async count() {
        let data = null;
        try {
            const connection = await Connections.getConnection(this.connection);
            data = await connection.queryBuilder("count", this.queryData);
        } catch (e) {
            console.error(e);
            throw new Error(e);
        }

        return data;
    }

    handleModelMapping(element) {
        if (!element) {
            return null;
        }

        if (!this.modelMapping) {
            throw new Error("Missing model-mapping element");
        }

        let clone = Object.assign(Object.create(Object.getPrototypeOf(this.modelMapping)), this.modelMapping);
        for (let i in element) {
            if (clone.casts && clone.casts[i]) {
                clone[i] =
                    typeof clone.casts[i] === "function"
                        ? clone.casts[i](element[i])
                        : clone.casts[i] === "datetime"
                        ? moment(element[i])
                        : element[i];
            } else {
                clone[i] = element[i];
            }
        }

        return clone;
    }
}

module.exports = QueryBuilder;
