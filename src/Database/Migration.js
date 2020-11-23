const Connections = require("./Connections");
const Config = require("../Config");
const MigrationTable = require("./MigrationTable");

class DatabaseMigration {
    connection = null;

    up() {}

    down() {}

    getConnectionConfig() {
        return this.connection === null
            ? Config.get("database.connections")[Config.get("database.default")]
            : Config.get("database.connections")[this.connection];
    }

    createTable(tableName, handle) {
        const connectionConfig = this.getConnectionConfig();
        if (!connectionConfig) {
            throw new Error("Error getting the migration-connection");
        }

        const driver = Connections.getDriverForConnection(connectionConfig);
        if (!driver) {
            throw new Error("Error getting the mirgation-connection-driver");
        }

        const connection = Connections.getConnection(
            this.connection === null ? Config.get("database.default") : this.connection
        );

        const table = new MigrationTable(tableName, true);
        handle(table);

        connection.createTable(tableName, table);
    }
}

module.exports = DatabaseMigration;
