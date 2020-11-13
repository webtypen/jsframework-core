class Model {
    connection = null; // Default connection
    table = null;
    keyColumn = "id";
    structure = null;

    static find(id) {
        // @ToDo
    }

    static where(column, operator, value) {
        // Query-Builder zurückgeben
    }

    delete() {
        // delete
    }

    save() {
        // save
    }
}

module.exports = Model;
