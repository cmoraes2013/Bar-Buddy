// Definition of the 'Brands' model
// This is the table of branded alcoholic beverages. In addition to ID, this
// table has bevName, description, category, import, and five accumulator columns
// to hold counts of user ratings by stars. These columns support calculation
// of a composite rating as the weighted average of the column counts.
//
// 5 stars: 200
// 4 stars: 140         5(200) + 4(140) + 3(110) + 2(10) + 1(75)
// 3 stars: 110    =>   ----------------------------------------  => 3.7
// 2 stars: 10                 (200 + 140 + 110 + 10 + 75)
// 1 star:  75

// Define the Brands model
module.exports = function(sequelize, Sequelize) {
  let Brands = sequelize.define('Brands', {
    brandId: {
      type: Sequelize.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    brandSerial: {
      type: Sequelize.BIGINT.UNSIGNED,
    },
    bevName: {
      type: Sequelize.STRING,
      allowNull: false
    },
    category: {
      type: Sequelize.STRING,
      allowNull: false
    },
    description: {
      type: Sequelize.STRING,
      allowNull: true
    },
    import: {
      type: Sequelize.BOOLEAN,
      allowNull: true
    },
    ratingsOneStar: {
      type: Sequelize.BIGINT,
      default: 0
    },
    ratingsTwoStar: {
      type: Sequelize.BIGINT,
      default: 0
    },
    ratingsThreeStar: {
      type: Sequelize.BIGINT,
      default: 0
    },
    ratingsFourStar: {
      type: Sequelize.BIGINT,
      default: 0
    },
    ratingsFiveStar: {
      type: Sequelize.BIGINT,
      default: 0
    }
  });

  return Brands;
};
