const Application = require("./Application");

const handleMiddleware = (req, res, next) => {
    next();
};

exports.route = (method, path, component, options) => {
    if (method === "get") {
        Application.app().get(path, handleMiddleware, component);
    }
};

exports.get = (path, component, options) => {
    exports.route("get", path, component, options);
};
