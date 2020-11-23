const bcrypt = require("bcryptjs");
const ConsoleCommand = require("../ConsoleCommand");
const Config = require("../../Config");

class UsersAddRole extends ConsoleCommand {
    static signature = "users:add-role";
    static description = "Add a role to an user";

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

        const roles = user.roles && user.roles.trim() !== "" ? JSON.parse(user.roles) : null;
        if (roles && roles.length > 0) {
            this.writeln("Current roles (" + user.email + "):");
            roles.forEach((role) => this.writeln("   " + role));
        } else {
            this.writeln("<fg=yellow>The user " + user.email + " has no roles yet.</>");
        }

        const newRole = await this.ask("New role:");
        if (newRole && newRole.trim() !== "") {
            if (!roles || roles.length < 1 || !roles.includes(newRole)) {
                const newRoles = roles && roles.length > 0 ? roles : [];
                newRoles.push(newRole.trim());

                user.roles = newRoles;
                await user.save();
            }
        }
    }
}

module.exports = UsersAddRole;
