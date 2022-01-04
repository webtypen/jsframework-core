"use strict";
const Application = require("./Application");
const Config = require("./Config");

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
    const prefix = Config.get("app.router.prefix");
    if (prefix && prefix.trim() !== "") {
        path = prefix.trim() + path;
    }

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
        try {
            return Promise.resolve(component(req, res, next)).catch((e) => {
                res.header("Access-Control-Allow-Origin", "*");
                res.header("Access-Control-Allow-Methods", "*");
                res.header("Access-Control-Allow-Headers", "*");
                res.header("x-powered-by", "webtpyen-jsframework");

                if (env("APP_DEBUG") && env("APP_DEBUG").toString().trim() === "true" && e) {
                    for (let i in e) {
                        console.log(i, e);
                    }

                    return res.status(500).send({
                        status: "error",
                        message: e.toString(),
                        error: e.stack,
                    });
                } else {
                    res.status(500).send({
                        status: "error",
                        message:
                            env("APP_ERROR500") && env("APP_ERROR500").toString().trim() !== ""
                                ? env("APP_ERROR500")
                                : "Internal Server Error",
                    });
                }

                throw e;
            });
        } catch (e) {
            if (env("APP_DEBUG") && env("APP_DEBUG").toString().trim() === "true" && e) {
                for (let i in e) {
                    console.log(i, e);
                }

                res.status(500).send({
                    status: "error",
                    message: e.toString(),
                    error: e.stack,
                });
            } else {
                res.status(500).send({
                    status: "error",
                    message:
                        env("APP_ERROR500") && env("APP_ERROR500").toString().trim() !== ""
                            ? env("APP_ERROR500")
                            : "Internal Server Error",
                });
            }

            throw e;
        }
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
