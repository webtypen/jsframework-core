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
            column: column,
            operator: operator,
            value: value,
        });
        return this;
    }

    async first() {
        const connection = await Connections.getConnection(this.connection);
        const data = await connection.queryBuilder("first", this.queryData);
        if (!this.modelMapping) {
            return data;
        }

        return this.handleModelMapping(data);
    }

    async get() {
        const connection = await Connections.getConnection(this.connection);
        const data = await connection.queryBuilder("get", this.queryData);
        if (!this.modelMapping) {
            return data;
        }

        return data && data.length > 0 ? data.map((el) => this.handleModelMapping(el)) : null;
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
