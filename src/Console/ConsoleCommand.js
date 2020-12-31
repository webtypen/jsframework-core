"use strict";
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

    error(line) {
        return this.output.error(line);
    }

    warning(line) {
        return this.output.warning(line);
    }

    caution(line) {
        return this.output.caution(line);
    }

    ask(question) {
        return this.output.ask(question);
    }

    askHidden(question) {
        return this.output.askHidden(question);
    }

    progress(length) {
        return this.output.progressStart(length);
    }

    progressAdvance(amount) {
        if (amount !== undefined && amount !== null && amount !== false) {
            return this.output.progressAdvance(amount);
        }
        return this.output.progressAdvance();
    }

    progressFinish() {
        return this.output.progressFinish();
    }
}

module.exports = ConsoleCommand;
