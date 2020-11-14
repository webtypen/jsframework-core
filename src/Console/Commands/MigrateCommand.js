const { glob } = require("glob");
const moment = require("moment");
const Connections = require("../../Database/Connections");
const Config = require("../../Config");
const ConsoleCommand = require("../ConsoleCommand");

class MigrateCommand extends ConsoleCommand {
    static signature = "migrate";
    static description = "Run database-migrations";
    currentBatch = null;

    async handle() {
        const migrations = glob.sync("./app/Migrations/**/*.js").map((file) => {
            const filename =
                file && file.indexOf("/") > -1 ? file.substring(file.trim().lastIndexOf("/") + 1).trim() : file;
            if (!filename || filename.trim() === "") {
                return null;
            }

            return {
                filename: filename,
                migration: require("../../../../../app/Migrations/" + filename),
            };
        });

        for (let i in migrations) {
            const migration = new migrations[i].migration();
            const check = await this.checkMigration(migrations[i].filename, migration);
            if (!check) {
                await this.handleMigration(migrations[i].filename, migration);
            }
        }
    }

    async handleMigration(name, migration) {
        this.write("<fg=yellow>" + name + "</> ... ");

        try {
            await migration.up();

            const connection = Connections.getConnection(
                migration.connection === null ? Config.get("database.default") : migration.connection
            );
            await connection.query(
                "INSERT INTO migrations SET batch = " +
                    this.currentBatch +
                    ", migration = '" +
                    name +
                    "', datetime = '" +
                    moment().format("YYYY-MM-DD HH:mm:ss") +
                    "'"
            );
        } catch (error) {
            this.writeln("<fg=red>Failed</>");
            this.writeln("");
            console.error(error);
            process.exit();
        }

        this.writeln("<fg=green>Success</>");
    }

    async checkMigration(name, migration) {
        const connection = Connections.getConnection(
            migration.connection === null ? Config.get("database.default") : migration.connection
        );

        const data = await connection.tableExists("migrations");
        if (!data) {
            this.currentBatch = 1;
            const migrationMigrationClass = require("../../Database/Migrations/2020-11-16-create-migrations-table");
            const migrationTable = new migrationMigrationClass();
            await this.handleMigration("2020-11-16-create-migrations-table.js", migrationTable);
        }

        const migrationsAlreadyRun = await connection.query("SELECT * FROM migrations");
        if (this.currentBatch === null) {
            migrationsAlreadyRun.forEach((el) => {
                if (this.currentBatch === null || parseInt(el.batch) >= parseInt(this.currentBatch)) {
                    this.currentBatch = el.batch + 1;
                }
            });
        }

        if (!migrationsAlreadyRun.find((el) => el.migration === name)) {
            await this.handleMigration(name, migration);
        }

        return true;
    }
}

module.exports = MigrateCommand;
