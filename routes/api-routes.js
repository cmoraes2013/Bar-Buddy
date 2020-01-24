// Requiring our models and passport as we've configured it
const db = require("../models");
const passport = require("../config/passport");
var currentRatings = [0,0,0,0,0];

module.exports = function(app) {
  // Using the passport.authenticate middleware with our local strategy.
  // If the user has valid login credentials, send them to the members page.
  // Otherwise the user will be sent an error
  app.post("/api/login", passport.authenticate("local"), function(req, res) {
    console.log(`Login request: ${req.body.userName} ${req.body.password}`)
    res.json(req.user);
  });

  // Route for signing up a user. The user's password is automatically hashed and stored securely thanks to
  // how we configured our Sequelize User Model. If the user is created successfully, proceed to log the user in,
  // otherwise send back an error
  app.post("/api/signup", function(req, res) {
    console.log(`Signup request: ${req.body.userName} ${req.body.password}`);
    db.Users.create({
      userName: req.body.userName,
      password: req.body.password
    })
      .then(function() {
        res.redirect(307, "/api/login");
      })
      .catch(function(err) {
        res.status(401).json(err);
      });
  });

  // Route for logging user out
  app.get("/logout", function(req, res) {
    req.logout();
    res.redirect("/");
  });

  // Route for getting some data about our user to be used client side
  app.get("/api/user_data", function(req, res) {
    if (!req.user) {
      // The user is not logged in, send back an empty object
      res.json({});
    } else {
      // Otherwise send back the userName
      // Sending back a password, even a hashed password, isn't a good idea
      console.log(`user data request: ${JSON.stringify(req.user)}`);
      // db.Users.findOne({
      //   where: {
      //     userName : currentUserName
      //   }
      // }).then((data) => {
        res.json({userName: req.user.userName, userId: req.user.userId});
      // })
    }
  });

  // Client would like to know about a particular brand.
  app.post("/api/brand", function(req, res) {
    if (!req.user) {
      // The user is not logged in, send back 401 Unauthorized
      console.log("Not a user");
      res.status(401);
    } else {
      // Let's go find the brand!
      let brandName = req.body.bevName.toUpperCase();
      console.log(`Search: ${brandName}`);
      db.Brands.findOne({
        where: {
          bevName: brandName
        }
        // ,include: db.Reviews
      }).then(function(data) {
        if (data.length == 0) {
          console.log(`Search Failure: ${brandName} not in Brands`);
          res.status(404);
        } else {
          console.log(data);
          currentRatings[0] = parseInt(data.dataValues.ratingsOneStar);
          currentRatings[1] = parseInt(data.dataValues.ratingsTwoStar);
          currentRatings[2] = parseInt(data.dataValues.ratingsThreeStar);
          currentRatings[3] = parseInt(data.dataValues.ratingsFourStar);
          currentRatings[4] = parseInt(data.dataValues.ratingsFiveStar);
          let sum = currentRatings[0]+currentRatings[1]+currentRatings[2]+currentRatings[3]+currentRatings[4];
          let avgR = (sum == 0) ? 0 :
            ((5*currentRatings[4]+4*currentRatings[3]+3*currentRatings[2]+2*currentRatings[1]+currentRatings[0]) / sum);
          let brandId = data.dataValues.brandId;
          let bevObj = {
            brandId     : brandId,
            bevName     : brandName,
            category    : data.dataValues.category,
            imported    : data.dataValues.import,
            description : data.dataValues.description,
            avgRating   : avgR.toFixed(1),
            rFiveStar   : currentRatings[4],
            rFourStar   : currentRatings[3],
            rThreeStar  : currentRatings[2],
            rTwoStar    : currentRatings[1],
            rOneStar    : currentRatings[0]
          }
          console.log(bevObj);
          res.json(bevObj);
        }
      });
    }
  });

  // Client would like to get all reviews for a brandId
  app.get("/api/review/:brandId", (req, res) => {
    console.log(`Received request for reviews for ${req.params.brandId}`);
    db.Reviews.findAll({
      where: {
        brandId:req.params.brandId
      }
    }).then ((data) => {
      if (data) {
        console.log(data);
        res.json(data);
      } else {
        res.status(401);
      }
    });
  });


  // Client would like to post a review.
  app.post("/api/review", function(req, res) {

    // let userData = {
    //   brandId: currentBrandId,
    //   userId: currentUserId,
    //   rating: $("#rating-input").val(),
    //   review: $("#review-input").val().trim()
    // };

    // validate this data!

    let rating = req.body.rating;
    console.log(`Received a review with rating ${rating}`);
    let brandId = req.body.brandId;
    db.Reviews.create({
      brandId       : brandId,
      userId        : req.body.userId,
      reviewRating  : rating,
      review        : req.body.review
    })
    .then(function() {
      switch (rating)
      {
        case '5': currentRatings[4]++; break;
        case '4': currentRatings[3]++; break;
        case '3': currentRatings[2]++; break;
        case '2': currentRatings[1]++; break;
        case '1': currentRatings[0]++;  
      }
      db.Brands.update({
        ratingsFiveStar : currentRatings[4],
        ratingsFourStar : currentRatings[3],
        ratingsThreeStar: currentRatings[2],
        ratingsTwoStar  : currentRatings[1],
        ratingsOneStar  : currentRatings[0],
      }, {
        where: {
          brandId : brandId
        }
      })
      .then((brandsUpdated) => {
          if (brandsUpdated[0]) {
            console.log(`Updated brandId ${brandId}`);
            res.json(brandsUpdated);
          } else {
            console.log('Update failed');
            res.status(417);
          }
        })
      })
  });


};
