"use strict";
const { get, set } = require("lodash");

var configDir = "../../../../config/";
var files = ["app", "auth", "database"];
var config = {};

exports.load = (path) => {
    if (path) {
        const tempConfig = require(configDir + path);
        if (tempConfig) {
            config[path] = tempConfig;
        }
    } else {
        for (let i in files) {
            const conf = require(configDir + files[i]);
            if (conf) {
                config[files[i]] = conf;
            }
        }
    }
};

exports.get = (configKey, defaultVal) => {
    return get(config, configKey, defaultVal);
};

exports.set = (configKey, value) => {
    return set(config, configKey, value);
};
