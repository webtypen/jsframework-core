"use strict";
const { Migration } = require("webtypen-jsframework");

class CreateMigrationsTable extends Migration {
    up() {
        this.createTable("migrations", (table) => {
            table.string("migration", { unique: true, primaryKey: true });
            table.integer("batch");
            table.datetime("datetime");
        });
    }
}

module.exports = CreateMigrationsTable;
