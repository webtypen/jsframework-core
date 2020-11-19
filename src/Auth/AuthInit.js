const passport = require("passport");
const Config = require("../Config");

module.exports = (app) => {
    if (Config.get("auth.default") && Config.get("auth.guards." + Config.get("auth.default"))) {
        const defaultAuth = Config.get("auth.guards." + Config.get("auth.default"));
        if (defaultAuth.driver === "passport-jwt") {
            try {
                require("./PassportJwtInit")(app, passport, defaultAuth);
            } catch (error) {
                console.error(error);
            }
        }
    }
};
