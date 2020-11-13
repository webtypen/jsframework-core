const { SymfonyStyle } = require("symfony-style-console");

class ConsoleCommand {
    static signature = "";
    static description = null;

    args = null;
    output = null;

    constructor() {
        this.output = new SymfonyStyle();
    }

    setArguments(args) {
        this.args = args;
    }

    getArguments() {
        return this.args;
    }

    writeln(line) {
        this.output.writeln(line);
    }

    write(line) {
        this.output.write(line);
    }
}

module.exports = ConsoleCommand;
