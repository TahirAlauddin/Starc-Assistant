function redirectToPage(page) {
  // Define the URL of the target page
  let targetPageURL = page;


  let isAdmin = sessionStorage.getItem("isAdmin");

  if (page.includes('login') && isAdmin == 'true') {
    targetPageURL = '../admin/admin-panel.html'
  }

  window.location.href = targetPageURL;
}


function sendLogOutRequest() {
  // let csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;

  fetch(`${BASE_URL}/logout/`, {
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
        sessionStorage.removeItem("isAdmin")
        window.location.replace("../home/home.html");
      } else {
        console.log('data', data)
      }
    })
    .catch(error => console.error('Error:', error));
}



// Function to fetch machine data from the API and organize it into a dictionary
async function fetchAndOrganizeMachineData() {
  try {
    const response = await fetch(`${BASE_URL}/machines`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const machines = await response.json();
    const departments = { "Tornitura": [], "Rettifiche": [], "Qualita": [] };

    // Check if there are no machines
    if (machines.count === 0) {
      console.log("No machines found.");
      return departments;
    }

    // Organize machines by departments
    machines.results.forEach(machine => {
      const { name, department_name } = machine;

      if (!departments[department_name]) {
        departments[department_name] = [];
      }
      departments[department_name].push(name);
    });

    return departments;
  } catch (error) {
    console.error('Error fetching or processing data: ', error);
  }
}

// // Call the function to fetch the data and organize it
// let departmentOptions = fetchAndOrganizeMachineData();

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
  fetchAndOrganizeMachineData().then(departments => {
    console.log(departments);
    let departmentOptions = departments;

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
  });
}
