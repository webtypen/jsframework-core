"use strict";
const fs = require("fs");
const ConsoleCommand = require("../ConsoleCommand");

class VersionCommand extends ConsoleCommand {
    static signature = "version";
    static description = "Show the installed framework version";

    handle() {
        const file = fs.readFileSync(process.cwd() + "/node_modules/@webtypen/jsframework-core/package.json", "utf-8");
        if (!file || file.toString().trim() === "") {
            this.error("Cannot read-file `" + process.cwd() + "/node_modules/@webtypen/jsframework-core/package.json`");
            return;
        }

        const json = JSON.parse(file);
        if (!json || !json.version || json.name !== "@webtypen/jsframework-core") {
            this.error(
                "File package.json of package `@webtypen/jsframework-core` does not contain valid information to check the version."
            );
            return;
        }

        this.writeln("Framework-Version: <fg=green>" + json.version + "</>");
    }
}

module.exports = VersionCommand;
