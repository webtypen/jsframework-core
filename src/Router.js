const Application = require("./Application");

const handleMiddleware = (req, res, next) => {
    next();
};

exports.route = (method, path, component, options) => {
    if (method === "get") {
        Application.app().get(path, handleMiddleware, component);
    } else if (method === "post") {
        Application.app().post(path, handleMiddleware, component);
    } else if (method === "put") {
        Application.app().put(path, handleMiddleware, component);
    } else if (method === "delete") {
        Application.app().delete(path, handleMiddleware, component);
    } else if (method === "any") {
        Application.app().all(path, handleMiddleware, component);
    }
};

exports.get = (path, component, options) => {
    exports.route("get", path, component, options);
};

exports.post = (path, component, options) => {
    exports.route("post", path, component, options);
};

exports.put = (path, component, options) => {
    exports.route("put", path, component, options);
};

exports.delete = (path, component, options) => {
    exports.route("delete", path, component, options);
};

exports.any = (path, component, options) => {
    exports.route("any", path, component, options);
};
