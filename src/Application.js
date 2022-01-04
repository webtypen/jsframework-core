"use strict";
const express = require("express");
const fileupload = require("express-fileupload");
const Connections = require("./Database/Connections");
const Config = require("./Config");
const Validator = require("./Validator");
var app = express();

exports.boot = (options) => {
    try {
        // Load env-variables
        require("dotenv").config();

        // beforeBoot()
        if (options && options.beforeBoot) {
            options.beforeBoot(app);
        }

        // Load global functions
        require("./lib/functions");

        // Load config
        Config.load();

        // Auth laden
        require("./Auth/AuthInit")(app);

        // Middleware
        app.use((req, res, next) => {
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Methods", "*");
            res.header("Access-Control-Allow-Headers", "*");
            res.header("x-powered-by", "webtpyen-jsframework");

            req.validationFails = (rules, options) => {
                const fails = Validator.fails(req.body, rules, options);
                if (fails && Object.keys(fails).length > 0) {
                    res.statusCode = 500;
                    res.send({
                        status: options && options.errorStatus ? options.errorStatus : "error",
                        message:
                            options && options.errorMessage
                                ? options.errorMessage
                                : "There was an error processing the request.",
                        errors: fails,
                    });
                    res.end();
                    return true;
                }

                return false;
            };
            next();
        });

        const limit = Config.get("app.requests.limit", "25mb");
        app.use(express.json({ limit: limit }));
        app.use(express.urlencoded({ limit: limit, extended: true }));

        // Error Handling
        app.use((err, req, res, next) => {
            res.status(500);
            res.send({
                status: "error",
                message:
                    env("APP_ERROR500") && env("APP_ERROR500").toString().trim() !== ""
                        ? env("APP_ERROR500")
                        : "Internal Server Error",
            });
        });

        // Load routes
        require("../../../../routes");

        // beforeListen()
        if (options && options.beforeListen) {
            options.beforeListen(app);
        }

        // Start express-app
        const port = Config.get("app.port");
        if (process.env.APP_RUNS_LOCAL && process.env.APP_RUNS_LOCAL === "true") {
            app.listen(port, () => {
                console.log(`App is listening for local development at: http://localhost:${port}`);
            });
        }
    } catch (e) {
        console.log("ERROR");
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
