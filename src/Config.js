const { get } = require("lodash");

var configDir = "../../../../config/";
var files = ["app", "auth", "database"];
var config = {};

exports.load = () => {
    for (let i in files) {
        console.log("Load conig file: " + files[i]);
    }
};

exports.get = (configKey) => {
    get(configKey, config);
};
