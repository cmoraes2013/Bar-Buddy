// Sequelize ORM connection and model instantiation file.

"use strict";

const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
let basename = path.basename(module.filename);
let env = process.env.NODE_ENV || "development";
let config = require(__dirname + "/../config/config.json")[env];
require("dotenv").config();
let db = {};

if (config.use_env_variable) {
  var sequelize = new Sequelize(process.env[config.use_env_variable], { dialect:"mysql" });
} else {
  var sequelize = new Sequelize(config.database, config.username, config.password, config);
}

fs
  // for all the files in this directory
  .readdirSync(__dirname)
  // which don't start with '.', are not this file, and do have extension '.js'
  .filter(function (file) {
    return (
      file.indexOf(".") !== 0 && file !== basename && file.slice(-3) === ".js"
    );
  })
  // create a model representing a database table, and assign to object 'db'
  .forEach(function (file) {
    let model = sequelize['import'](path.join(__dirname, file));
    db[model.name] = model;
  });

// and for each model created, check for association (join) references
Object.keys(db).forEach(function (modelName) {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
