"use strict";
const passport = require("passport");

exports.handle = passport.authenticate("jwt", { session: false });
