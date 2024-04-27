function loginUser() {
  let usernameInput = document.getElementById("username-input");
  let passwordInput = document.getElementById("password-input");

  let csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;

  // Prepare the data to send
  let data = {
    'username': usernameInput.value,
    'password': passwordInput.value
  };

  // Send a POST request to the /login endpoint
  fetch(`${BASE_URL}/login/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': csrfToken  // Add the CSRF token to the request headers
    },
    body: JSON.stringify(data)
  }).then(response => response.json())
    .then(data => {
      // Check the response to determine if the user is an admin
      if (data.isAdmin) {
        sessionStorage.setItem("isAdmin", "true");
        window.location.replace("../admin/admin-panel.html");
      } else {
        // Handle non-admin users or show an error message
        showMessage('Incorrect credentials! Please try again', 'error')
      }
    })
    .catch(error => {
      console.error('Error:', error);
      // Handle errors like failed requests or server errors
    });
}
  


// Execute a function when the user presses a key on the keyboard
document.getElementById('password-input').addEventListener("keypress", function(event) {
  // If the user presses the "Enter" key on the keyboard
  if (event.key === "Enter") {
    // Cancel the default action, if needed
    event.preventDefault();
    // Trigger the button element with a click
    document.getElementById("login-btn").click();
  }
});