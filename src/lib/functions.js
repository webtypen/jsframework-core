"use strict";
global.env = function (key, defaultValue) {
    if (process.env[key] && process.env[key].toString().trim() !== "") {
        return process.env[key];
    }
    return defaultValue !== undefined ? defaultValue : null;
};
