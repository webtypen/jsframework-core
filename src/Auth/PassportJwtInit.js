const passport = require("passport");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const StrategyJWT = require("passport-jwt").Strategy;
const ExtractJWT = require("passport-jwt").ExtractJwt;
const Router = require("../Router");

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

    if (guard.loginPath) {
        Router.any(guard.loginPath, async (req, res) => {
            if (req.user) {
                throw new Error("Already logged in");
            }

            const email =
                req.body && req.body.email ? req.body.email : req.query && req.query.email ? req.query.email : null;
            const password =
                req.body && req.body.password
                    ? req.body.password
                    : req.query && req.query.password
                    ? req.query.password
                    : null;
            if (!email || !password || email.trim() === "" || password.trim() === "") {
                throw new Error("`email` and `password` are required");
            }

            const user = await guard.model.where("email", "=", email).first();
            if (!user || !user.is_active) {
                return res.status(500).send({
                    status: "error",
                    message: "Login failed",
                });
            }

            if (!bcrypt.compareSync(password, user[guard.password ? guard.password : "password"])) {
                return res.status(500).send({
                    status: "error",
                    message: "Login failed",
                });
            }

            const token = jwt.sign(user.toArray(true), guard.secret, {
                expiresIn: guard.tokenExpiration ? guard.tokenExpiration : 604800 * 2, // 2 weeks
            });

            return res.send({ status: "success", message: "Authentication successfull", token });
        });
    }

    return app;
};
