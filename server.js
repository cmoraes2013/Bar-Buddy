// server.js - entry point and initialization file.
//
// This version of server.js is generic to a server-client Web App with
// User Authentication via passport/express-session, and a mySQL database
// behind the sequelize ORM.

//********************
//*   Dependencies   *
//********************

// Requiring necessary npm packages
const express = require('express');
const session = require('express-session');
const checkModel = require('./config/checkModel.js');
// passport.js has been tailored for a 'Local' strategy
let passport = require('./config/passport.js');

//***************
//*   Startup   *
//***************

// HTTP port assignment; use environment variable if it exists.
let PORT = process.env.PORT ? process.env.PORT : 8080;

// load and run index.js in the ./models directory
let db = require('./models');

// Configure express
let app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

// Session specification - session is established on valid login
app.use(
  session({
    secret: 'profound keyphrase',
    resave: true,
    saveUninitialized: true
  })
);
app.use(passport.initialize());
app.use(passport.session());

// Register our route handlers
require('./routes/html-routes.js')(app);
require('./routes/api-routes.js')(app);

// 'Sync' the ORM model with the database tables, on completion link to the HTTP service.
db.sequelize.sync({ force: true }).then(() => {
  checkModel();
  app.listen(PORT, () => {
    console.log(`Serving PORT ${PORT}`);
  });
});