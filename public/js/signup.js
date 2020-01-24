$(document).ready(function() {
  // Getting references to our form and input
  var signUpForm = $("form.signup");
  var userNameInput = $("input#text-input");
  var passwordInput = $("input#password-input");

  // When the signup button is clicked, we validate the username and password are not blank
  signUpForm.on("submit", function(event) {
    event.preventDefault();
    var userData = {
      userName: userNameInput.val().trim(),
      password: passwordInput.val().trim()
    };

    if (!userData.userName || !userData.password) {
      return;
    }
    // If we have an email and password, run the signUpUser function
    signUpUser(userData.userName, userData.password);
    userNameInput.val("");
    passwordInput.val("");
  });

  // Does a post to the signup route. If successful, we are redirected to the members page
  // Otherwise we log any errors
  function signUpUser(userName, password) {
    $.post("/api/signup", {
      userName: userName,
      password: password
    })
      .then(function(data) {
        window.location.replace("/members");
        // If there's an error, handle it by throwing up a bootstrap alert
      })
      .catch(handleLoginErr);
  }

  function handleLoginErr(err) {
    $("#alert .msg").text(err.responseJSON);
    $("#alert").fadeIn(500);
  }
});
