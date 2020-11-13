var commands = [];

exports.register = (commandClass) => {
    commands.push(commandClass);
};

exports.getAll = () => {
    return commands;
};

exports.getByGroup = () => {
    const groups = {
        0: [],
    };
    commands.forEach((command) => {
        if (command.signature.indexOf(":") > 0) {
            const group = command.signature.trim().substring(0, command.signature.trim().indexOf(":"));
            if (!groups[group]) {
                groups[group] = [];
            }

            groups[group].push(command);
        } else {
            groups[0].push(command);
        }
    });

    return groups;
};

exports.getByCommand = (command) => {
    return commands.find((el) => el.signature === command);
};
