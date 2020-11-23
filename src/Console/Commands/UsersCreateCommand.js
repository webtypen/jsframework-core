const bcrypt = require("bcryptjs");
const ConsoleCommand = require("../ConsoleCommand");
const Config = require("../../Config");

class UsersCreateCommand extends ConsoleCommand {
    static signature = "users:create";
    static description = "Create a new user";

    async handle() {
        const guard = Config.get("auth.guards." + Config.get("auth.default"));

        let email = null;
        while (email == null) {
            const newEmail = await this.ask("E-Mail:");
            const check = await guard.model.where("email", "=", newEmail).first();
            if (check) {
                this.writeln("<fg=blue>There is already an user with this email: " + newEmail + "</>");
            } else {
                email = newEmail;
            }
        }

        let password = null;
        while (password == null) {
            const newPassword = await this.askHidden("Password:");
            const check = await this.askHidden("Repeat:");

            if (newPassword.trim() !== "" && newPassword === check) {
                password = newPassword;
            } else {
                this.writeln("<fg=yellow>The passwords do not match.</>");
            }
        }

        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(password, salt);

        const user = new guard.model();
        user.email = email;
        user.name = await this.ask("Name:");
        user.is_active = true;
        user.roles = [];
        user.password = hash;
        await user.save();
    }
}

module.exports = UsersCreateCommand;
