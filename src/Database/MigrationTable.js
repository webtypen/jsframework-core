"use strict";
class MigrationTable {
    table = null;
    create = false;
    newColumns = [];
    changedColumns = [];

    constructor(table, create) {
        this.table = table;
        this.create = create ? true : false;
    }

    addColumn(type, name, options) {
        this.newColumns.push({
            type: type,
            name: name,
            options: options,
        });
    }

    increment(name, options) {
        if (!options) {
            options = {};
        }
        options["auto_increment"] = true;

        this.addColumn("integer", name, options);
    }

    integer(name, options) {
        this.addColumn("integer", name, options);
    }

    string(name, options) {
        this.addColumn("string", name, options);
    }

    text(name, options) {
        this.addColumn("text", name, options);
    }

    boolean(name, options) {
        this.addColumn("boolean", name, options);
    }

    datetime(name, options) {
        this.addColumn("datetime", name, options);
    }

    timestamps() {
        this.addColumn("datetime", "created_at");
        this.addColumn("datetime", "updated_at");
    }

    getNewColumns() {
        return this.newColumns;
    }

    getChangesColumns() {
        return this.changedColumns;
    }
}

module.exports = MigrationTable;
