const glob = require("glob");
const { SymfonyStyle } = require("symfony-style-console");
const Config = require("../Config");
const ConsoleRegistry = require("./ConsoleRegistry");
const OverviewCommand = require("./Commands/OverviewCommand");
const MigrateCommand = require("./Commands/MigrateCommand");
const VersionCommand = require("./Commands/VersionCommand");
const PresetReactCommand = require("./Commands/PresetReactCommand");
const UsersCreateCommand = require("./Commands/UsersCreateCommand");
const UsersActivate = require("./Commands/UsersActivate");
const UsersDeactivate = require("./Commands/UsersDeactivate");
const UsersAddRole = require("./Commands/UsersAddRole");
const UsersRemoveRole = require("./Commands/UsersRemoveRole");
const Application = require("../Application");
const CompileCommand = require("./Commands/CompileCommand");

// Load env-Variables
require("dotenv").config();

// Load global functions
require("../lib/functions");

// Load config
Config.load();

const argv = process.argv.slice(2);
ConsoleRegistry.register(VersionCommand);
ConsoleRegistry.register(MigrateCommand);
ConsoleRegistry.register(PresetReactCommand);
ConsoleRegistry.register(UsersCreateCommand);
ConsoleRegistry.register(UsersActivate);
ConsoleRegistry.register(UsersDeactivate);
ConsoleRegistry.register(UsersAddRole);
ConsoleRegistry.register(UsersRemoveRole);
ConsoleRegistry.register(CompileCommand);

// Load Commands
const commandFiles = glob.sync("./app/Commands/**/*.js");
if (commandFiles && commandFiles.length > 0) {
    for (let i in commandFiles) {
        ConsoleRegistry.register(require("../../../../." + commandFiles[i]));
    }
}

if (!argv || !argv[0] || argv[0].trim() === "" || argv[0].trim().substring(0, 1) === "-") {
    const command = new OverviewCommand(argv);
    command.setArguments(argv.slice(1));

    (async () => {
        command.handle();

        // Close all
        Application.close("console");
    })();
} else {
    const command = ConsoleRegistry.getByCommand(argv[0]);
    if (!command) {
        const io = new SymfonyStyle();
        io.error("Command " + argv[0] + " not found ...");
        process.exit();
    }

    const instance = new command();
    instance.setArguments(argv.slice(1));

    (async () => {
        await instance.handle();

        // Close all
        Application.close("console");
    })();
}
