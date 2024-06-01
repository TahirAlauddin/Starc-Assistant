function redirectToPage(page) {
  // Define the URL of the target page
  let targetPageURL = page;


  let isAdmin = sessionStorage.getItem("isAdmin");

  if (page.includes('login') && isAdmin == 'true') {
    targetPageURL = '../admin/admin-panel.html'
  }

  window.location.href = targetPageURL;
}


function sendLogOutRequest(page='admin') {
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
        if (page == 'previous') {
          window.location.replace("../../home/home.html");
        } else {
          window.location.replace("../home/home.html");
        }
      } else {
        console.log('data', data)
      }
    })
    .catch(error => console.error('Error:', error));
}


async function fetchAndOrganizeMachineData() {
  try {
    let url = `${BASE_URL}/machines`;
    const departments = { "Tornitura": [], "Rettifiche": [], "Qualita": [] };
    while (url) {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        return departments
      }

      const machines = await response.json();
      url = machines.next;  // Update the URL to the next page, if it exists

      // Check if there are no machines
      if (machines.count === 0) {
        console.log("No machines found.");
        return departments;
      }

      // Organize machines by departments
      machines.results.forEach(machine => {
        const { name, department } = machine;

        if (!departments[department]) {
          departments[department] = [];
        }
        departments[department].push(name);
      });
    }

    return departments;
  } catch (error) {
    const departments = { "Tornitura": [], "Rettifiche": [], "Qualita": [] };
    return departments;
    console.error('Error fetching or processing data: ', error);
  }
}


// Function to add options to the dropdown based on department
async function addOptionsToDropdown(department) {
  await fetchAndOrganizeMachineData().then(departments => {
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
