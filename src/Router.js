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

    if (method === "get") {
        Application.app().get(path, component);
    } else if (method === "post") {
        Application.app().post(path, component);
    } else if (method === "put") {
        Application.app().put(path, component);
    } else if (method === "delete") {
        Application.app().delete(path, component);
    } else if (method === "any") {
        Application.app().all(path, component);
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
