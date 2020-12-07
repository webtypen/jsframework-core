"use strict";
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
