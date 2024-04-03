function redirectToPage(page) {
  // Define the URL of the target page
  let targetPageURL = page;


  let isAdmin = sessionStorage.getItem("isAdmin");

  if (page == 'login.html' && isAdmin == 'true') {
    targetPageURL = 'admin-panel.html'
  }

  window.location.href = targetPageURL;
}


function sendLogOutRequest() {
  // let csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;

  fetch('http://localhost:8000/logout/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // 'X-CSRFToken': csrfToken  // Add the CSRF token to the request headers

    },
    body: JSON.stringify({ action: 'logout' })
  })
    .then(response => response.json())
    .then(data => {
      if (data.status == 'success') {
        sessionStorage.setItem("isAdmin", "false")
        window.location.replace("index.html");
      } else {
        console.log('data', data)
      }
    })
    .catch(error => console.error('Error:', error));
}


// Data for the options
let departmentOptions = {
  Tornitura: [
    "Graziano",
    "Mori Seiki",
    "Okuma",
    "Puma SMX",
    "Doosan TT",
    "DMG Mori",
  ],
  Rettifiche: ["Proflex 2", "Proflex 3", "Lizzini", "Kopp", "Sagitech"],
  Qualita: [
    "Adcole",
    "Altimetro",
    "Calibro",
    "Micrometro",
    "Taylor Hobson",
    "Proiettore Di Profili",
    "Durometro",
    "3D CMM",
    "Attacco Acido",
  ],
};

// Function to add options to the dropdown based on department
function addOptionsToDropdown(department) {
  var selectElement = document.getElementById("custom-dropdown");
  // Clear existing options first
  selectElement.innerHTML = "";

  var optionsData = departmentOptions[department];
  if (optionsData) {
    for (var i = 0; i < optionsData.length; i++) {
      var option = document.createElement("option");
      option.text = optionsData[i];
      option.value = optionsData[i];
      selectElement.add(option);
    }
  }
}
