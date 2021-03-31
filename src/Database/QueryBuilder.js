"use strict";
const Config = require("../Config");
const Connections = require("./Connections");
const moment = require("moment");

class QueryBuilder {
    connection = null;
    queryData = {
        table: null,
        filter: [],
        orderBy: [],
        select: null,
        limit: null,
        offset: null,
        modelMapping: null,
        collation: null,
    };

    constructor(connection) {
        this.connection = connection ? connection : Config.get("database.default");
    }

    setModelMapping(model) {
        this.queryData.modelMapping = model;
        return this;
    }

    table(table) {
        this.queryData.table = table;
        return this;
    }

    select(array) {
        if (array && array.length > 0) {
            for (let i in array) {
                if (array[i] === undefined || array[i] === null) {
                    continue;
                }

                if (this.queryData.select === null) {
                    this.queryData.select = [];
                }
                this.queryData.select.push(array[i]);
            }
        }
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

    collation(collation) {
        this.queryData.collation = collation;
        return this;
    }

    async first() {
        let data = null;
        try {
            const connection = await Connections.getConnection(this.connection);
            data = await connection.queryBuilder("first", this.queryData);
            if (!this.queryData.modelMapping) {
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
        if (!this.queryData.modelMapping) {
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

    async delete() {
        let data = null;

        try {
            const connection = await Connections.getConnection(this.connection);
            data = await connection.queryBuilder("delete", this.queryData);
        } catch (e) {
            console.error(e);
            throw new Error(e);
        }

        return data;
    }

    async aggregate(settings, skipModelMapping) {
        let data = null;

        try {
            this.queryData.aggregate = settings;
            const connection = await Connections.getConnection(this.connection);
            data = await connection.queryBuilder("aggregate", this.queryData);
        } catch (e) {
            console.error(e);
            throw new Error(e);
        }

        return data && data.length > 0
            ? skipModelMapping
                ? data
                : data.map((el) => this.handleModelMapping(el))
            : null;
    }

    handleModelMapping(element) {
        if (!element) {
            return null;
        }

        if (!this.queryData.modelMapping) {
            throw new Error("Missing model-mapping element");
        }

        let clone = Object.assign(
            Object.create(Object.getPrototypeOf(this.queryData.modelMapping)),
            this.queryData.modelMapping
        );
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
