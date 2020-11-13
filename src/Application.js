var express = require("express");
var app = express();

exports.boot = () => {
    require("../../../routes");

    const port = 3000;
    app.listen(port, () => {
        console.log(`Example app listening at http://localhost:${port}`);
    });
};

exports.app = () => {
    return app;
};
