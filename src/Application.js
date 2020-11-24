const express = require("express");
const fileupload = require("express-fileupload");
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
        console.log("ERROR:");
        console.log(err);
        res.status(500).json({ status: "error", error: error });
    });
    console.log("LOG-INIT");

    // Start express-app
    const port = Config.get("app.port");
    app.listen(port, () => {
        console.log(`Example app listening at http://localhost:${port}`);
    });

    return app;
};

exports.app = () => {
    return app;
};

exports.close = (mode) => {
    Connections.closeAll();
};
