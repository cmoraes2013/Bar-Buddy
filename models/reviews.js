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
    userId: {
      type: Sequelize.BIGINT.UNSIGNED,
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

  Reviews.associate = function(models) {
  // A Review comes from a User; a Review can't be created without a 
  // User due to the foreign key constraint
    Reviews.belongsTo(models.Users, {
      foreignKey: {
        allowNull: false
      }
    });
  };

  Reviews.associate = function(models) {
  // A Review is about a Brand; a Review can't be created without a 
  // Brand due to the foreign key constraint
    Reviews.belongsTo(models.Brands, {
      foreignKey: {
        allowNull: false
      }
    });
  };

  return Reviews;
};
