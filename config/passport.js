// Passport package configuration and login logic
//

const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

const db = require("../models");

// Telling passport we want to use a Local Strategy.
// In other words, we want login with a username/email and password
passport.use(
  new LocalStrategy(
    {
      // "username"
      usernameField: "userName"
    },
    function(userName, password, done) {
      // When a user tries to sign in this code runs
      db.Users.findOne({
        where: {
          userName: userName
        }
      }).then(function(dbUser) {
        // If there's no user with the given userName
        if (!dbUser) {
          return done(null, false, {
            message: "User unknown. Please sign up."
          });
        }
        // If there is a user with the given userName,
        // but the password doesn't match
        else if (!dbUser.validPassword(password)) {
          return done(null, false, {
            message: "Incorrect password."
          });
        }
        // Success! Return the user
        return done(null, dbUser);
      });
    }
  )
);

// To help keep authentication state across HTTP requests,
// Sequelize needs to serialize and deserialize the user
passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});

// Exporting our configured passport
module.exports = passport;
