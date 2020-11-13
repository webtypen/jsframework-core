const ConsoleCommand = require("../ConsoleCommand");

class DatabaseChangesCommand extends ConsoleCommand {
    static signature = "database:changes";
    static description = "Determine currently required database changes and maybe apply them";

    handle() {
        this.writeln("Database changes currently required are determined ...");
    }
}

module.exports = DatabaseChangesCommand;
