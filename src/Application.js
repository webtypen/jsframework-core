const express = require("express");
const fileupload = require("express-fileupload");
const Connections = require("./Database/Connections");
const Config = require("./Config");
const Logger = require("./Logger");
var app = express();

exports.boot = () => {
    // Load env-variables
    require("dotenv").config();

    // Load global functions
    require("./lib/functions");

    // Load config
    Config.load();

    // Auth laden
    require("./Auth/AuthInit")(app);

    // Middleware
    app.use(function (req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Methods", "*");
        res.header("Access-Control-Allow-Headers", "*");
        res.header("x-powered-by", "serverless-express");
        next();
    });
    app.use(fileupload());
    app.use(express.json());

    // Load routes
    require("../../../routes");

    app.use((err, req, res, next) => {
        if (env("APP_DEBUG") === "true") {
            Logger.logError(err.message, err.stack);

            res.status(500).json({ status: "error", message: err.message, stack: err.stack });
        } else {
            res.status(500).json({ status: "error", message: "Internal server error." });
        }
    });

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
