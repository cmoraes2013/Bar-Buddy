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
      // Our user will sign in using an email, rather than a "username"
      usernameField: "email"
    },
    function(email, password, done) {
      // When a user tries to sign in this code runs
      db.Users.findOne({
        where: {
          email: email
        }
      }).then(function(dbUser) {
        // If there's no user with the given email
        if (!dbUser) {
          return done(null, false, {
            message: "User unknown. Please sign up."
          });
        }
        // If there is a user with the given email,
        // but the password the user gives us is incorrect
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
