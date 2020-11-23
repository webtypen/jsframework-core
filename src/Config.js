const { get, set } = require("lodash");
const Logger = require("./Logger");

var configDir = "../../../config/";
var files = ["app", "auth", "database"];
var config = {};

exports.load = () => {
    Logger.debug("Load config files:");
    for (let i in files) {
        Logger.debug("   - " + files[i]);

        const conf = require(configDir + files[i]);
        if (conf) {
            config[files[i]] = conf;
        }
    }
};

exports.get = (configKey) => {
    return get(config, configKey);
};

exports.set = (configKey, value) => {
    return set(config, configKey, value);
};
