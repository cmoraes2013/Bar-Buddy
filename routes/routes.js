// Bar Buddy route handling - consolidated file
const path      = require("path");
const db        = require("../models");
const Sequelize = require("sequelize");
const passport  = require("../config/passport");



// The server keeps these 'page variables' to 
let currentUserName  = '';
let currentBrandName = '';
let currentBrandId   = 0;
let currentRatings   = [0,0,0,0,0];

// This is the BMF handlebars object. These initial values should
// be chosen to give the members page with only the search form.
let bevObj = {
  loggedIn    : false,
  userName    : '',
  showForm    : false,
  showSearch  : false,
  brandId     : 0,
  bevName     : 'test',
  category    : '',
  imported    : '',
  description : '',
  avgRating   : 0,
  rFiveStar   : 0,
  rFourStar   : 0,
  rThreeStar  : 0,
  rTwoStar    : 0,
  rOneStar    : 0,
  reviews     : [],
  searchNames : []
};

module.exports = function(app) {

  app.get("/home", function(req, res) {
    //res.sendFile(path.join(__dirname, "../public/members.html"));
    // @*@*@ use bevObj through handlebars
    res.render("index", bevObj);
  });

  app.get("/signup", function(req, res) {
    res.sendFile(path.join(__dirname, "../public/signup.html"));
  });

  app.get("/login", function(req, res) {
    res.sendFile(path.join(__dirname, "../public/login.html"));
  });

  app.get("/members", function(req, res) {
    res.render("index",req.body);
  });

  // Using the passport.authenticate middleware with our local strategy.
  // If the user has valid login credentials, send them to the members page.
  // Otherwise the user will be sent an error
  app.post("/api/login", passport.authenticate("local"), (req, res) => {
    console.log(`Login request: ${req.body.userName} ${req.body.password}`)
    if (req.user) {
      currentUserName = req.body.userName;
    }
    res.json(req.user);
  });

  // Route for signing up a user. The user's password is hashed and stored securely. 
  // If the user is created successfully, proceed to the members page,
  // otherwise return an error.
  app.post("/api/signup", function(req, res) {
    console.log(`Signup request: ${req.body.userName} ${req.body.password}`);
    currentUserName = req.body.userName;
    db.Users.create({
      userName: req.body.userName,
      password: req.body.password
    })
    .then((rowsAffected) => {
      // rowsAffected is an array whose first element is the number of rows affected.
      // here we expect either creation of one row, or zero rows if the userName
      // is not unique. 
      if (rowsAffected[0] == 0) {
        currentUserName = '';
        res.status(417);
      } else {
        passport.authenticate("local");
        res.redirect(307, "/members");
      }
    })
    .catch(function(err) {
      res.status(401).json(err);
    });
  });

  // Route for logging user out
  app.get("/logout", function(req, res) {
    currentUserName = '';
    req.logout();
    res.redirect("/");
  });

  // Client would like to know about a particular brand.
  // The brand names have spaces, so to avoid manipulating
  // them for use as params, we're allowing the client to
  // but them in the req.body.
  app.post("/api/brand", function(req, res) {
    // the Brands table uses uppercase.
    let brandName = req.body.bevName.toUpperCase();

    console.log(`Search: ${brandName}`);
    // look for the name in the Brands table
    db.Brands.findOne({
      where: {
        bevName: brandName
      }
    })
    .then((data) => {
      if (!data) {
        // uh-oh, a miss.
        console.log(`Search Failure: ${brandName} not in Brands. Try partial.`);
        res.end();
      } else {
        // When a new search succeeds, a new brandId and bevName for 
        // seeing and creating Reviews is established. 
        // it won't change until another search succeeds.
        currentBrandId   = data.dataValues.brandId;
        currentBrandName = data.dataValues.bevName;

        // form the weighted average
        currentRatings[0] = parseInt(data.dataValues.ratingsOneStar);
        currentRatings[1] = parseInt(data.dataValues.ratingsTwoStar);
        currentRatings[2] = parseInt(data.dataValues.ratingsThreeStar);
        currentRatings[3] = parseInt(data.dataValues.ratingsFourStar);
        currentRatings[4] = parseInt(data.dataValues.ratingsFiveStar);
        let sum = currentRatings[0]+currentRatings[1]+currentRatings[2]+currentRatings[3]+currentRatings[4];
        let avgR = (sum == 0) ? 0 : 
          ((currentRatings[0]+2*currentRatings[1]+3*currentRatings[2]+4*currentRatings[3]+5*currentRatings[4]) / sum);

        // Populate the brand info into a custom object
        bevObj = {
          loggedIn    : (currentUserName != ''),
          userName    : currentUserName,
          showForm    : true,
          showSearch  : false,
          brandId     : data.dataValues.brandId,
          bevName     : currentBrandName,
          category    : data.dataValues.category,
          imported    : data.dataValues.import,
          description : data.dataValues.description,
          avgRating   : avgR.toFixed(1),
          rFiveStar   : currentRatings[4],
          rFourStar   : currentRatings[3],
          rThreeStar  : currentRatings[2],
          rTwoStar    : currentRatings[1],
          rOneStar    : currentRatings[0],
          // this is a persistent object, so dump any old reviews
          reviews     : [],
          // and clear the last search results
          searchNames : []
        }
        // Now fetch the reviews for this brand
        db.Reviews.findAll({
          where: {
            brandId: currentBrandId
          }
        })
        .then ((data) => {
          if (data) {
            // Note the use of unshift; the reviews are found in id order, which is
            // chronological order given the id auto-increment assignment.
            // with unshift, the oldest will be at the highest index in the reviews array.
            data.forEach((elt) => {bevObj.reviews.unshift(elt);});
            console.log(JSON.stringify(bevObj));
            res.status(200).end();
          } else {
            res.status(401);
          }
        });
      }
    });
  });

  // Client would like to find brands from an incomplete name.
  // This query will return a different object -- session info
  // and an array of names where each matches the pattern.
  app.post("/api/match", function(req, res) {
    // the Brands table uses uppercase.
    let brandSearchName = `${req.body.bevName.toUpperCase()}%`;

    console.log(`Pattern search: ${brandSearchName}`);
    // look for the name in the Brands table
    db.Brands.findAll({
      attributes: ['brandId','bevName'],
      where: {
        bevName: {
          [Sequelize.Op.like]: brandSearchName
        }  
      }
    })
    .then((data) => {
      if (!data) {
        // nothing matches this pattern
        res.end();
      } else {
        // Search results:
        bevObj.loggedIn    = (currentUserName != ''),
        bevObj.userName    =  currentUserName,
        bevObj.showForm    = false;
        bevObj.showSearch  = true;
        bevObj.reviews     = [];
        bevObj.searchNames = [];
        data.forEach((elt) => {bevObj.searchNames.push(elt.dataValues.bevName);});
        res.json(bevObj);
      }  
    });
  });

  // Client would like to post a review.
  app.post("/api/review", (req, res) => {
    console.log('Request to post a Review');
    if (!req.user) {
      // 401 Unauthorized
      res.status(401);
    } else {
      console.log(`Logged in, creating Review`);

      // make sure the rating is in 1..5
      let rating = req.body.rating;
      rating = rating < 1 ? 1 : (rating > 5 ? 5 : rating);

      // there are some protections on the Reviews table, like
      // length of userName and non-empty review.
      db.Reviews.create({
        brandId       : currentBrandId,
        userName      : currentUserName,
        reviewRating  : rating,
        review        : req.body.review
      })
      .then(() => {
        // now need to update the Brands table to capture the
        // new rating.
        console.log(`Review Posted. Updating ${currentBrandName} (${currentBrandId})`);

        // adjust the correct counter
        switch (rating)
        {
          case '5': currentRatings[4]++; break;
          case '4': currentRatings[3]++; break;
          case '3': currentRatings[2]++; break;
          case '2': currentRatings[1]++; break;
          case '1': currentRatings[0]++;  
        }
        // then update the ratings 
        db.Brands.update({
          ratingsFiveStar : currentRatings[4],
          ratingsFourStar : currentRatings[3],
          ratingsThreeStar: currentRatings[2],
          ratingsTwoStar  : currentRatings[1],
          ratingsOneStar  : currentRatings[0],
        }, {
          where: {
            brandId : currentBrandId
          }
        })
        .then((brandsUpdated) => {
          if (brandsUpdated[0]) {
            console.log(`brandsUpdated[0] ${brandsUpdated[0]}, brandId ${currentBrandId}`);
            res.json(brandsUpdated);
          } else {
            console.log('Update failed');
            res.status(417);
          }
        })
      })  
    }
  });

}
