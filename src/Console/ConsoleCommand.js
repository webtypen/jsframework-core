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
        return this.output.writeln(line);
    }

    write(line) {
        return this.output.write(line);
    }

    success(line) {
        return this.output.success(line);
    }

    ask(question) {
        return this.output.ask(question);
    }

    askHidden(question) {
        return this.output.askHidden(question);
    }
}

module.exports = ConsoleCommand;
