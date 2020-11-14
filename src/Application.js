var express = require("express");
const Connections = require("./Database/Connections");
const Config = require("./Config");
var app = express();

exports.boot = () => {
    // Load env-variables
    require("dotenv").config();

    // Load global functions
    require("./lib/functions");

    // Load config
    Config.load();

    // Load routes
    require("../../../routes");

    // Start express-app
    const port = Config.get("app.port");
    app.listen(port, () => {
        console.log(`Example app listening at http://localhost:${port}`);
    });
};

exports.app = () => {
    return app;
};

exports.close = (mode) => {
    Connections.closeAll();
};
