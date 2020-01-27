// Definition of the 'Review' model
// This is the table of user reviews. In addition to its own ID, this table
// has columns for the brandId, UserId, and assigned rating.

// Reviews model
module.exports = function(sequelize, Sequelize) {
  let Reviews = sequelize.define("Reviews", {
    reviewId: {
      type: Sequelize.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    brandId: {
      type: Sequelize.BIGINT.UNSIGNED,
      allowNull: false
    },
    userName: {
      type: Sequelize.STRING,
      allowNull: false
    },
    reviewRating: {
      type: Sequelize.INTEGER,
      allowNull: false,
      validate: {
        isNumeric: true,
        min: 1,
        max: 5
      }
    },
    createdAt: {
      type: Sequelize.DATE,
      allowNull: true
    },      
    updatedAt: {
      type: Sequelize.DATE,
      allowNull: true    
    },
    review: {
      type: Sequelize.TEXT,
      allowNull: false
    }
  });

  return Reviews;
};
