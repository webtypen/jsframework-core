"use strict";
const ConsoleCommand = require("../ConsoleCommand");
const Config = require("../../Config");

class UsersDeactivate extends ConsoleCommand {
    static signature = "users:deactivate";
    static description = "Deactivate an user";

    async handle() {
        const guard = Config.get("auth.guards." + Config.get("auth.default"));

        let user = null;
        while (user == null) {
            const email = await this.ask("E-Mail:");
            const check = await guard.model.where("email", "=", email).first();
            if (!check) {
                this.writeln("<fg=red>There is no user with this email-address: " + email + "</>");
            } else {
                user = check;
            }
        }

        user.is_active = false;
        await user.save();
        this.success("User successfully deactivated: " + user.email);
    }
}

module.exports = UsersDeactivate;
