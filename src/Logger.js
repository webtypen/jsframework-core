const fs = require("fs");
const moment = require("moment");

const datePrefix = () => {
    const d = new Date();
    return (
        [d.getMonth() + 1, d.getDate(), d.getFullYear()].join("/") +
        " " +
        [d.getHours(), d.getMinutes(), d.getSeconds()].join(":")
    );
};

exports.log = (message, date) => {
    if (date) {
        console.log(datePrefix(), message);
        return;
    }
    console.log(message);
};

exports.debug = (message, date) => {
    if (env("APP_DEBUG") !== "true") {
        return;
    }

    if (date) {
        console.log(datePrefix(), message);
        return;
    }
    console.log(message);
};

exports.logError = (error, stack) => {
    const date = moment();
    const dir = "./storage/logs/" + date.format("YYYY") + "/" + date.format("MM");
    const filename = "errors_" + date.format("YYYY-MM-DD") + ".log";

    if (!fs.existsSync(dir)) {
        fs.mkdir(dir, { recursive: true }, (err) => {
            if (err) {
                throw err;
            }
        });
    }

    const errorContent =
        "[ERROR - " +
        date.format() +
        "]:\n" +
        error +
        (stack && stack.toString() && stack.toString().trim() !== "" ? stack.toString() : "") +
        "\n";
    console.log(errorContent);
    fs.appendFile(dir + "/" + filename, errorContent, (err) => {
        if (err) {
            throw err;
        }
    });
};
