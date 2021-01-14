"use strict";
const express = require("express");
const fileupload = require("express-fileupload");
const Connections = require("./Database/Connections");
const Config = require("./Config");
const Logger = require("./Logger");
var app = express();

exports.boot = () => {
    try {
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
            res.header("x-powered-by", "webtpyen-jsframework");
            next();
        });

        const limit = Config.get("app.requests.limit", "25mb");
        app.use(express.json({ limit: limit }));
        app.use(express.urlencoded({ limit: limit, extended: true }));

        // Load routes
        require("../../../routes");

        // Start express-app
        const port = Config.get("app.port");
        if (process.env.APP_RUNS_LOCAL && process.env.APP_RUNS_LOCAL === "true") {
            app.listen(port, () => {
                console.log(`App is listening for local development at: http://localhost:${port}`);
            });
        }
    } catch (e) {
        console.error(e);
    }
    return app;
};

exports.app = () => {
    return app;
};

exports.close = (mode) => {
    Connections.closeAll();
};
