"use strict";
const Application = require("./Application");

const registerMiddleware = (method, path, middleware) => {
    if (middleware === "auth") {
        middleware = require("./Auth/AuthMiddleware");
    }

    if (!middleware || !middleware.handle) {
        return null;
    }

    if (method === "get") {
        Application.app().get(path, middleware.handle);
    } else if (method === "post") {
        Application.app().post(path, middleware.handle);
    } else if (method === "put") {
        Application.app().put(path, middleware.handle);
    } else if (method === "delete") {
        Application.app().delete(path, middleware.handle);
    } else if (method === "any") {
        Application.app().all(path, middleware.handle);
    }
};

exports.route = (method, path, component, options) => {
    if (options && options.middleware) {
        if (Array.isArray(options.middleware)) {
            for (let i in options.middleware) {
                registerMiddleware(method, path, options.middleware[i]);
            }
        } else {
            registerMiddleware(method, path, options.middleware);
        }
    }

    const componentMethod = async (req, res, next) => {
        return Promise.resolve(component(req, res, next)).catch((e) => {
            console.log("catch");
            console.error(e);

            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Methods", "*");
            res.header("Access-Control-Allow-Headers", "*");
            res.header("x-powered-by", "webtpyen-jsframework");

            res.status(200).send({
                status: "error",
            });
        });
    };

    if (method === "get") {
        Application.app().get(path, componentMethod);
    } else if (method === "post") {
        Application.app().post(path, componentMethod);
    } else if (method === "put") {
        Application.app().put(path, componentMethod);
    } else if (method === "delete") {
        Application.app().delete(path, componentMethod);
    } else if (method === "any") {
        Application.app().all(path, componentMethod);
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
