const Config = require("../Config");

var drivers = {
    mysql: require("./Driver/MySQLDriver"),
};
var connections = {};

exports.registerDriver = (key, driver) => {
    drivers[key] = driver;
};

exports.getDriverForConnection = (connection) => {
    if (typeof connection === "string") {
        connection = Config.get("database.connections." + connection);
    }

    if (connection && connection.driver) {
        return drivers[connection.driver];
    }
    return null;
};

exports.createConnection = async (key) => {
    const connection = Config.get("database.connections." + key);
    if (!connection) {
        throw new Error("Error while connecting to database: connection `" + key + "` not found");
    }

    const driver = exports.getDriverForConnection(key);
    if (!driver) {
        throw new Error("Error while connecting to database: driver `" + key + "` could not be loaded");
    }

    connections[key] = new driver(connection);
    connections[key].connect();

    return true;
};

exports.getConnection = (key) => {
    if (key === null) {
        key = Config.get("database.default");
    }

    if (!connections) {
        connections = {};
    }

    if (!connections[key]) {
        exports.createConnection(key);
    }

    return connections[key];
};

exports.closeAll = () => {
    for (let i in connections) {
        connections[i].close();
    }
};
