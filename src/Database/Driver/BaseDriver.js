"use strict";
class BaseDriver {
    static name = null;
    config = null;
    connection = null;

    constructor(connectionConfig) {
        this.config = connectionConfig;
    }

    connect() {}
    close() {}
    createTable(tableName, migrationName) {}
    query(statement) {}
    tableExists(tableName) {}
    columnExists(tableName) {}
    insert() {}
    update() {}
    delete() {}
    queryBuilder() {}

    getConnection() {
        return this.connection;
    }
}

module.exports = BaseDriver;
