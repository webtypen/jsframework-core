"use strict";
const QueryBuilder = require("./QueryBuilder");
const Connections = require("./Connections");

class Model {
    connection = null; // Default connection
    table = null;
    keyColumn = "id";
    sortKey = null;
    sortKeyColumn = null;
    frameworkIgnored = [
        "hidden",
        "casts",
        "frameworkIgnored",
        "connection",
        "table",
        "keyColumn",
        "sortKey",
        "sortKeyColumn",
        "ignored",
    ];
    ignored = [];
    hidden = [];
    casts = {
        created_at: "datetime",
        updated_at: "datetime",
    };

    static find(id) {
        const model = new this();
        const builder = new QueryBuilder(model.connection);
        builder.setModelMapping(model);
        builder.table(model.table);

        if (typeof id === "object" && Array.isArray(id)) {
            for (let i in id) {
                if (i == 0) {
                    builder.where(model.keyColumn, "=", id[i]);
                } else {
                    builder.orWhere(model.keyColumn, "=", id[i]);
                }

                if (model.sortKey && model.sortKeyColumn) {
                    builder.where(model.sortKeyColumn, "=", model.sortKey);
                }
            }
            return builder.get();
        }

        builder.where(model.keyColumn, "=", id);

        if (model.sortKey && model.sortKeyColumn) {
            builder.where(model.sortKeyColumn, "=", model.sortKey);
        }

        return builder.first();
    }

    static where(column, operator, value) {
        const model = new this();
        const builder = new QueryBuilder(model.connection);
        builder.setModelMapping(model);
        builder.table(model.table);

        if (model.sortKey && model.sortKeyColumn) {
            builder.where(model.sortKeyColumn, "=", model.sortKey);
        }

        builder.where(column, operator, value);

        return builder;
    }

    static orderBy(column, order) {
        const model = new this();
        const builder = new QueryBuilder(model.connection);
        builder.setModelMapping(model);
        builder.table(model.table);

        builder.orderBy(column, order);

        return builder;
    }

    static take(amount, offset) {
        const model = new this();
        const builder = new QueryBuilder(model.connection);
        builder.setModelMapping(model);
        builder.table(model.table);

        builder.take(amount, offset);

        return builder;
    }

    async getConnection() {
        return await Connections.getConnection(this.connection);
    }

    static async get() {
        const model = new this();
        const builder = new QueryBuilder(model.connection);
        builder.setModelMapping(model);
        builder.table(model.table);

        if (model.sortKey && model.sortKeyColumn) {
            builder.where(model.sortKeyColumn, "=", model.sortKey);
        }

        return await builder.get();
    }

    delete() {
        // delete
    }

    async save() {
        const values = {};
        for (let i in this) {
            if (!this.frameworkIgnored.includes(i) && !this.ignored.includes(i)) {
                values[i] = this[i];
            }
        }

        if (this[this.keyColumn] && this[this.keyColumn] !== null && this[this.keyColumn].toString().trim() !== "") {
            return await this.update(this[this.keyColumn], values);
        } else {
            const data = await this.insert(values);
            if (data && typeof data === "object" && data.primaryKey && data.primaryKey.trim() !== "") {
                this[this.keyColumn] = data.primaryKey;
            }

            return data;
        }
    }

    toArray(withHiddenFields) {
        const values = {};
        for (let i in this) {
            if (
                withHiddenFields ||
                (!this.frameworkIgnored.includes(i) && !this.hidden.includes(i) && !this.ignored.includes(i))
            ) {
                values[i] = this[i];
            }
        }

        return values;
    }

    async update(id, mappings) {
        const connection = await this.getConnection();
        return connection.update(id, this.keyColumn, this.table, mappings);
    }

    async insert(mappings) {
        const connection = await this.getConnection();
        return await connection.insert(this.table, mappings);
    }

    delete() {}
}

module.exports = Model;
