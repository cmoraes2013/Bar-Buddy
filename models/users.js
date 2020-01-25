// Definition of the 'User' model
// This is the table of registered users. In addition to username and encrypted
// password, the model includes space for preferred categories of drinks.

// Requiring bcryptjs for password hashing. Note that bcrypt is reportedly
// problematic on Windows.
let bcrypt = require('bcryptjs');

// Creating our User model
module.exports = function(sequelize, Sequelize) {
  let Users = sequelize.define('Users', {
    userId: {
      type: Sequelize.BIGINT.UNSIGNED, 
      autoIncrement: true, 
      primaryKey: true
    },
    // The email cannot be null, and must be a proper email before creation
    userName: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
      validate: {
        len: [6,100]
      }
    },
    // The password cannot be null
    password: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        len: [8,100]
      }
    },
    // categories are for future implementation of favorite categories.
    // use-model would be to prompt a user to review new brands within
    // preferred categories.
    categoryOne: {
      type: Sequelize.STRING,
      allowNull: true
    },
    categoryTwo: {
      type: Sequelize.STRING,
      allowNull: true
    },
    categoryThree: {
      type: Sequelize.STRING,
      allowNull: true
    }
  });
  
  // Assign a method to unhash a stored password and compare it to a new password
  Users.prototype.validPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
  };

  // Hooks are automatic methods that run during various phases of the User Model lifecycle
  // In this case, before a User is created, we will automatically hash their password
  Users.addHook('beforeCreate', function(user) {
    user.password = bcrypt.hashSync(
      user.password,
      bcrypt.genSaltSync(10),
      null
    );
  });

  return Users;
};
