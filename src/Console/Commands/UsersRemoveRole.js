const bcrypt = require("bcryptjs");
const ConsoleCommand = require("../ConsoleCommand");
const Config = require("../../Config");

class UsersRemoveRole extends ConsoleCommand {
    static signature = "users:remove-role";
    static description = "Remove a role from an user";

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
            return;
        }

        const newRole = await this.ask("Role to remove:");
        if (newRole && newRole.trim() !== "") {
            if (roles.includes(newRole) && roles.indexOf(newRole) > -1) {
                roles.splice(roles.indexOf(newRole), 1);

                user.roles = roles;
                await user.save();
            } else {
                this.writeln("<fg=red>The role was not found on the user-account</>");
            }
        }
    }
}

module.exports = UsersRemoveRole;
