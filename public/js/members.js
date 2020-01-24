$(document).ready(function() {
  // This file just does a GET request to figure out which user is logged in
  // and updates the HTML on the page
  let currentBevName = '';
  let currentBrandId = 0;
  let currentUserId = 0;

  $.get("/api/user_data").then(function(data) {
    currentUserId = data.userId;
    $(".member-name").text(data.userName);
  });

  const getReviews = (brandId) => {
    $.get("/api/reviews/"+brandId), (data) => {
      if (data) {
        console.log(`Reviews received for Brand ${brandId}`);
        $(".reviews-block").text(data);
      }
    }
  }

  const getBev = (userData) => {
    $.post("/api/brand", userData)
    .then(function(data) {
      currentBrandId = data.brandId;
      console.log(`Received brandId ${data.brandId} information`);
      $("#searchResult").text(JSON.stringify(data));
      // window.location.replace("/members");
      $(".review").show();
      getReviews(data.brandId);
    });
  }

  // Service form submittal with server query
  $(".search").on("submit", (event) => {
    event.preventDefault();
    currentBevName = $("#search-input").val().trim().toUpperCase();
    let userData = {bevName: currentBevName}; 
    $("#search-input").val("");
    if (userData.bevName) {
      // Ask for brand info and any reviews
      getBev(userData);
    }
  });

  // Service form submittal with server query
  $(".review").on("submit", (event) => {
    event.preventDefault();
    let userData = {
      brandId: currentBrandId,
      userId: currentUserId,
      rating: $("#rating-input").val(),
      review: $("#review-input").val().trim()
    };
    $("#rating-input").val("");
    $("#review-input").val("");
    console.log(`Posting a Review: ${JSON.stringify(userData)}`);
    if (userData.rating && userData.review)
      // Ask for brand info and any reviews
      $.post("/api/review", userData)
      .then(function(data) {
        getBev({bevName: currentBevName});
        // window.location.replace("/members");
      });
    // }
  });


})
