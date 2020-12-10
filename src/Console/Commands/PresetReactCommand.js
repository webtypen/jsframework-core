"use strict";
const ConsoleCommand = require("../ConsoleCommand");

class PresetReactCommand extends ConsoleCommand {
    static signature = "preset:react";
    static description = "Create a react-app";

    handle() {
        this.writeln("Feature coming soon ...");
    }
}

module.exports = PresetReactCommand;
