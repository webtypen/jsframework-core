const QueryBuilder = require("./QueryBuilder");
const Connections = require("./Connections");

class Model {
    connection = null; // Default connection
    table = null;
    keyColumn = "id";
    frameworkIgnored = ["hidden", "casts", "frameworkIgnored", "connection", "table", "keyColumn"];
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
        builder.where(model.keyColumn, "=", id);

        return builder.first();
    }

    static where(column, operator, value) {
        const model = new this();
        const builder = new QueryBuilder(model.connection);
        builder.setModelMapping(model);
        builder.table(model.table);
        builder.where(column, operator, value);

        return builder;
    }

    async getConnection() {
        return await Connections.getConnection(this.connection);
    }

    delete() {
        // delete
    }

    async save() {
        const values = {};
        for (let i in this) {
            if (!this.frameworkIgnored.includes(i)) {
                values[i] = this[i];
            }
        }

        if (this[this.keyColumn] && this[this.keyColumn] !== null && this[this.keyColumn].toString().trim() !== "") {
            return await this.update(this[this.keyColumn], values);
        } else {
            return await this.insert(values);
        }
    }

    toArray(withHiddenFields) {
        const values = {};
        for (let i in this) {
            if (withHiddenFields || (!this.frameworkIgnored.includes(i) && !this.hidden.includes(i))) {
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
        return connection.insert(this.table, mappings);
    }

    delete() {}
}

module.exports = Model;