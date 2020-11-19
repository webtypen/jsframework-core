const moment = require("moment");
const mysql = require("mysql");
const util = require("util");
const BaseDriver = require("./BaseDriver");

class MySQLDriver extends BaseDriver {
    static name = "mysql";

    tableCache = {};

    columnMappings = {
        string: { type: "VARCHAR", defaultLength: 255 },
        text: { type: "TEXT" },
        longtext: { type: "TEXT" },
        integer: { type: "INT" },
        boolean: { type: "BOOL" },
        date: { type: "DATE" },
        datetime: { type: "DATETIME" },
    };

    async connect() {
        this.connection = mysql.createConnection({
            host: this.config.host,
            port: this.config.port,
            database: this.config.database,
            user: this.config.user,
            password: this.config.password,
        });

        await this.connection.connect();
    }

    async close() {
        if (this.connection) {
            await this.connection.end();
        }
    }

    async createTable(tableName, migrationTable) {
        const columns = migrationTable.getNewColumns();
        if (!columns) {
            throw new Error("There are no columns available for creation of table `" + tableName + "`");
        }

        let query =
            "CREATE TABLE " +
            tableName +
            "(" +
            columns.map((column, i) => {
                const type = this.columnMappings[column.type];
                if (!type) {
                    throw new Error("Unknown mysql-column-type: " + column.type);
                }

                let append = "";
                const nullable = column.options && column.options.nullable === true ? true : false;
                if (nullable) {
                    append = " NULL";
                } else {
                    append = " NOT NULL";
                }

                if (column.options && column.options.auto_increment === true) {
                    append = " NOT NULL AUTO_INCREMENT PRIMARY KEY";
                }

                if (column.options && column.options.default) {
                    append = " DEFAULT " + column.options.default;
                }

                if (column.options && column.options.unique) {
                    append = " UNIQUE KEY";
                }

                if (column.options && column.options.primaryKey) {
                    append = " PRIMARY KEY";
                }

                if (column.options && column.options.comment) {
                    append = " COMMENT '" + comment + "'";
                }

                return (
                    column.name +
                    " " +
                    type.type +
                    (type.defaultLength || (column.options && column.options.length)
                        ? "(" +
                          (column.options && column.options.length > 0 ? column.options.length : type.defaultLength) +
                          ")"
                        : "") +
                    append
                );
            }) +
            ");";

        try {
            const data = await this.connection.query(query);
        } catch (error) {
            console.error(error);
            process.exit();
        }
    }

    async query(statement) {
        const query = util.promisify(this.connection.query).bind(this.connection);

        try {
            return await query(statement);
        } catch (error) {
            console.error(error);
        }

        return null;
    }

    async tableExists(tableName) {
        const data = await this.query("SHOW TABLES LIKE '" + tableName + "';");
        if (data && data[0]) {
            const keys = Object.keys(data[0]);
            if (keys[0] && data[0][keys[0]] && data[0][keys[0]] === tableName) {
                return true;
            }
        }

        return false;
    }

    async columnExists(tableName, columnName) {
        const data = await this.query("SHOW COLUMNS FROM `" + tableName + "` LIKE " + mysql.escape(columnName) + ";");
        if (data && data[0] && data[0].Field == columnName) {
            return data[0];
        }

        return false;
    }

    async insert(tableName, mappings) {
        const columns = Object.keys(mappings);
        if (!columns.includes("created_at")) {
            if (!this.tableCache[tableName] || !this.tableCache[tableName].created_at) {
                if (!this.tableCache[tableName]) {
                    this.tableCache[tableName] = {};
                }
                this.tableCache[tableName]["created_at"] = await this.columnExists(tableName, "created_at");
            }

            if (this.tableCache[tableName]["created_at"]) {
                mappings.created_at = moment().format("YYYY-MM-DD hh:mm:ss");
            }
        }

        if (!columns.includes("updated_at")) {
            if (!this.tableCache[tableName] || !this.tableCache[tableName].updated_at) {
                if (!this.tableCache[tableName]) {
                    this.tableCache[tableName] = {};
                }
                this.tableCache[tableName]["updated_at"] = await this.columnExists(tableName, "updated_at");
            }

            if (this.tableCache[tableName]["updated_at"]) {
                mappings.updated_at = moment().format("YYYY-MM-DD hh:mm:ss");
            }
        }

        let statement =
            "INSERT INTO `" +
            tableName +
            "` SET " +
            Object.keys(mappings).map((key) => {
                return "`" + key + "` = " + mysql.escape(this.handleInsertValue(mappings[key]));
            });
        await this.query(statement);
        return true;
    }

    async update(id, keyColumn, tableName, mappings) {
        if (!this.tableCache[tableName] || !this.tableCache[tableName].updated_at) {
            if (!this.tableCache[tableName]) {
                this.tableCache[tableName] = {};
            }
            this.tableCache[tableName]["updated_at"] = await this.columnExists(tableName, "updated_at");
        }

        if (this.tableCache[tableName]["updated_at"]) {
            mappings.updated_at = moment().format("YYYY-MM-DD hh:mm:ss");
        }

        let statement =
            "UPDATE `" +
            tableName +
            "` SET " +
            Object.keys(mappings).map((key) => {
                return "`" + key + "` = " + mysql.escape(this.handleInsertValue(mappings[key]));
            }) +
            " WHERE `" +
            keyColumn +
            "` = " +
            mysql.escape(id);
        await this.query(statement);
        return true;
    }

    handleInsertValue(value) {
        if (typeof value === "object" && value instanceof moment) {
            value = value.format("YYYY-MM-DD hh:mm:ss");
        } else if (typeof value === "object") {
            value = JSON.stringify(value);
        }
        return value;
    }

    async queryBuilder(type, queryData) {
        let query = "SELECT " + (queryData.select ? "" : "*") + " FROM " + queryData.table;
        if (queryData.filter && queryData.filter.length > 0) {
            query += " WHERE ";

            for (let i in queryData.filter) {
                query +=
                    (i > 0 ? " AND " : "") +
                    "`" +
                    queryData.filter[i].column +
                    "` " +
                    queryData.filter[i].operator +
                    " " +
                    mysql.escape(queryData.filter[i].value);
            }
        }

        const data = await this.query(query);
        if (type === "first") {
            return data && data.length > 0 && data[0] ? data[0] : null;
        }
        return data && data.length > 0 ? data : null;
    }
}

module.exports = MySQLDriver;
