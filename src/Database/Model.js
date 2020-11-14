const Connections = require("./Connections");

class Model {
    connection = null; // Default connection
    table = null;
    keyColumn = "id";

    static find(id) {
        // @ToDo
    }

    static where(column, operator, value) {
        // Query-Builder zurückgeben
    }

    getConnection() {
        return Connections.getConnection(this.connection);
    }

    delete() {
        // delete
    }

    save() {
        const ignoredFields = ["connection", "table", "keyColumn"];

        const values = {};
        for (let i in this) {
            if (!ignoredFields.includes(i)) {
                values[i] = this[i];
            }
        }

        if (this[this.keyColumn] && this[this.keyColumn] !== null && this[this.keyColumn].toString().trim() !== "") {
            this.update(this[this.keyColumn], values);
        } else {
            this.insert(values);
        }
    }

    update(id, mappings) {
        console.log("update");
    }

    insert(mappings) {
        console.log("");
        const connection = this.getConnection();
        connection.insert(this.table, mappings);
    }

    delete() {}
}

module.exports = Model;
