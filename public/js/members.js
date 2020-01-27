$(document).ready(function() {

  // Page update function used after successful search
  // and successful Review post.
  const getBev = (userData) => {
    // query for matching brand.  
    $.post("/api/brand", userData)
    .then((data) => {
      // show Rate & Review form after finding a brand
      // the server makes one big ugly object of brand info
      // and Reviews; intended to be suitable for handlebars.

      // @*@*@*@*@*@*@*@*@*@*@*@*@*@*@*@*@*@*@*@*@*@*@*@*@*@*@*@*@*@

      // @*@*@  insert res.reload() call here!

      // @*@*@ the next four lines are only needed until handlebars is 
      // @*@*@ writing this data attribute as part of re-providing the page.

      // @*@*@ so delete this 'if' and its contents
      if (data) {

        $(".review").show();
        $("#bigBlob-block").attr("data-bevName",data.bevName);

        // @*@*@ and of course handlebars will have integrated this 
        // @*@*@ data as the page was being produced for delivery
        $("#bigBlob-block").text(JSON.stringify(data));
      } else {
        // no match. try a pattern match.
        $.post("/api/match", userData)
        .then((data) => {
          $(".review").hide();
          $("#bigBlob-block").text(JSON.stringify(data));
        })
      }
    })
  }

  // Search
  $(".search").on("submit", (event) => {
    event.preventDefault();

    // Read the search box, then clean up and uppercase the input.
    // (The brand names are in uppercase in the Brands table.)
    let userData = {bevName: $("#search-input").val().trim().toUpperCase()}; 

    // If there was text content...
    if (userData.bevName) {
      // ...ask for brand info and any reviews
      getBev(userData);
      // Wipe the search box.  Tidy, tidy.
      $("#search-input").val("");
    }
  });

  // Post a Review (Rating + Review)
  $(".review").on("submit", (event) => {
    event.preventDefault();

    // Assign an object for the post
    let reviewData = {
      rating: $("#rating-input").val(),
      review: $("#review-input").val().trim()
    };

    // Clean up the entry boxes
    $("#rating-input").val("");
    $("#review-input").val("");

    // Need a rating and text
    if (reviewData.rating && reviewData.review) {
      console.log(`Posting a Review: ${JSON.stringify(reviewData)}`);

      // Ask for brand info and any reviews
      $.post("/api/review", reviewData)
      .then((data) => {
        // @*@*@ Expectation that server will determine whether user logged in
        // @*@*@ And handlebars logic will decide what's shown
        if (data) {
          $("#show-logout").show();
          $("#show-login").hide();
        } else {
          $("#show-logout").hide();
          $("#show-login").show();
        }

        // @*@*@ Expectation is that handlebars provides 
        // @*@*@ 'data-bevName="{{bigObj.bevName}}"' as an 
        // @*@*@ attribute of the bigBlob-block <div>
        getBev({bevName : $("#bigBlob-block").attr("data-bevName")});
      })
    }  
  });

})
