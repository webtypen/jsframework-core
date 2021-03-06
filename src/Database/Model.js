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

    static select(array) {
        const model = new this();
        const builder = new QueryBuilder(model.connection);
        builder.setModelMapping(model);
        builder.table(model.table);

        if (model.sortKey && model.sortKeyColumn) {
            builder.where(model.sortKeyColumn, "=", model.sortKey);
        }

        builder.select(array);

        return builder;
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

    static whereIn(column, array) {
        const model = new this();
        const builder = new QueryBuilder(model.connection);
        builder.setModelMapping(model);
        builder.table(model.table);

        if (model.sortKey && model.sortKeyColumn) {
            builder.where(model.sortKeyColumn, "=", model.sortKey);
        }

        builder.whereIn(column, array);

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

    static async aggregate(settings, skipModelMapping) {
        const model = new this();
        const builder = new QueryBuilder(model.connection);
        if (!skipModelMapping) {
            builder.setModelMapping(model);
        }

        builder.table(model.table);

        return await builder.aggregate(settings, skipModelMapping);
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

    static async count() {
        const model = new this();
        const builder = new QueryBuilder(model.connection);
        builder.setModelMapping(model);
        builder.table(model.table);

        if (model.sortKey && model.sortKeyColumn) {
            builder.where(model.sortKeyColumn, "=", model.sortKey);
        }

        return await builder.count();
    }

    async delete() {
        const builder = new QueryBuilder(this.connection);
        builder.setModelMapping(this);
        builder.table(this.table);

        builder.where(this.keyColumn, "=", this[this.keyColumn]);
        if (this.sortKey && this.sortKeyColumn) {
            builder.where(this.sortKeyColumn, "=", this.sortKey);
        }
        return await builder.delete();
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
}

module.exports = Model;
