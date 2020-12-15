"use strict";
const ConsoleCommand = require("../ConsoleCommand");
const Config = require("../../Config");

class UsersActivate extends ConsoleCommand {
    static signature = "users:activate";
    static description = "Activate an user";

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

        user.is_active = true;
        await user.save();
        this.success("User successfully activated: " + user.email);
    }
}

module.exports = UsersActivate;
