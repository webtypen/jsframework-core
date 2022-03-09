"use strict";
const ConsoleCommand = require("../ConsoleCommand");

class RoutesListCommand extends ConsoleCommand {
    static signature = "routes";
    static description = "Lists all registered routes ...";

    handle() {
        process.env.FRAMEWORK_TRACK_ROUTES = true;
        
        this.writeln("Registered routes:");
        require("../../../../../../routes");

        if(!process.FRAMEWORK_ROUTES || process.FRAMEWORK_ROUTES.length < 1) {
            this.writeln("Looks like there are no routes ...");
        } else {
            for (let i in process.FRAMEWORK_ROUTES) {
                this.writeln(process.FRAMEWORK_ROUTES[i].method + ": " + process.FRAMEWORK_ROUTES[i].path);
            }
            this.writeln("");
            this.writeln("Found " + process.FRAMEWORK_ROUTES.length + " routes.");
        }
    }
}

module.exports = RoutesListCommand;
