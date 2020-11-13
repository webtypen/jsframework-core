const ConsoleCommand = require("../ConsoleCommand");

class VersionCommand extends ConsoleCommand {
    static signature = "version";
    static description = "Show the installed framework version";

    handle() {
        this.writeln("Version: -");
    }
}

module.exports = VersionCommand;
