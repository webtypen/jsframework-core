"use strict";
const passport = require("passport");
const StrategyJWT = require("passport-jwt").Strategy;
const ExtractJWT = require("passport-jwt").ExtractJwt;

module.exports = (app, guard) => {
    const options = {};
    options.jwtFromRequest = ExtractJWT.fromAuthHeaderAsBearerToken();
    options.secretOrKey = guard.secret;

    passport.use(
        new StrategyJWT(options, async (jwtPayload, done) => {
            const tempModel = new guard.model();
            let user;
            try {
                user = await guard.model.find(jwtPayload[tempModel.keyColumn]);
            } catch (error) {
                console.error(error);
                return done(error, null);
            }

            if (!user) {
                return done(null, false);
            }

            done(null, user);
        })
    );

    app.use(passport.initialize());
    app.use(passport.session());

    return app;
};
