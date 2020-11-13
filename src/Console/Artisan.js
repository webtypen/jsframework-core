const { SymfonyStyle } = require("symfony-style-console");
const ConsoleRegistry = require("./ConsoleRegistry");
const OverviewCommand = require("./Commands/OverviewCommand");
const DatabaseChangesCommand = require("./Commands/DatabaseChangesCommand");
const VersionCommand = require("./Commands/VersionCommand");
const PresetReactCommand = require("./Commands/PresetReactCommand");

const argv = process.argv.slice(2);
ConsoleRegistry.register(VersionCommand);
ConsoleRegistry.register(DatabaseChangesCommand);
ConsoleRegistry.register(PresetReactCommand);

if (!argv || !argv[0] || argv[0].trim() === "" || argv[0].trim().substring(0, 1) === "-") {
    const command = new OverviewCommand(argv);
    command.setArguments(argv.slice(1));
    command.handle();
} else {
    const command = ConsoleRegistry.getByCommand(argv[0]);
    if (!command) {
        const io = new SymfonyStyle();
        io.error("Command " + argv[0] + " not found ...");
        process.exit();
    }

    const instance = new command();
    instance.setArguments(argv.slice(1));
    instance.handle();
}
