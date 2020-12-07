"use strict";
const ConsoleCommand = require("../ConsoleCommand");
const ConsoleRegistry = require("../ConsoleRegistry");

class OverviewCommand extends ConsoleCommand {
    handle() {
        const commandGroups = ConsoleRegistry.getByGroup();

        this.writeln("<fg=yellow>webtypen JS-Framework</>");
        this.writeln("<fg=yellow>=====================</>");
        this.writeln("Version: <fg=green>-</>");
        this.writeln("Usage:   <fg=green>node artisan [command] [attributes/options]</>");
        this.writeln("");

        this.writeln("<fg=yellow>Available commands:</>");
        const width = "                                     ";
        for (let group in commandGroups) {
            if (!commandGroups[group] || commandGroups[group].length < 1) {
                continue;
            }

            if (group && group.trim() !== "") {
                if (group.trim() !== "0") {
                    this.writeln("<fg=yellow>" + group + "</>");
                }

                for (let i in commandGroups[group]) {
                    this.writeln(
                        " " +
                            commandGroups[group][i].signature +
                            (width.length > commandGroups[group][i].signature.length
                                ? width.substring(0, width.length - commandGroups[group][i].signature.length)
                                : "") +
                            commandGroups[group][i].description
                    );
                }
            }
        }
    }
}

module.exports = OverviewCommand;
