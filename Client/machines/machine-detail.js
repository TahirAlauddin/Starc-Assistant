function getParameterByName(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

document.addEventListener("DOMContentLoaded", async function () {
  await fetchDepartments();
  var action = getParameterByName("machine");

  // Hide or show buttons based on the action
  if (action == null) {
    console.log("add", action);
    document.getElementById("add-btn").style.display = "flex";
    document.getElementById("edit-btn").style.display = "none";
    document.getElementById("del-btn").style.display = "none";
  } else {
    console.log("edit", action);
    document.getElementById("add-btn").style.display = "none";
    document.getElementById("edit-btn").style.display = "flex";
    document.getElementById("del-btn").style.display = "flex";

    var machineName = getParameterByName("machine");

    var departmentName = getParameterByName("department");

    var id = getParameterByName("id");

    const button = document.querySelector(".del-btn");
  
    button.setAttribute("data-machine-id", id);
    const editButton = document.querySelector(".edit-btn");
  
    editButton.setAttribute("data-machine-id", id);
    document.getElementById("machine-name").value = machineName;
    document.getElementById("heading-name").innerText = machineName.toUpperCase();

    var departmentSelect = document.getElementById("department");
    departmentSelect.value = departmentName
  }

});

async function fetchDepartments() {
  try {
    const response = await fetch(`${BASE_URL}/departments/`);
    const data = await response.json();

    const selectElement = document.getElementById("department");
    data.forEach((department) => {
      const optionElement = document.createElement("option");
      optionElement.value = department.name;
      optionElement.textContent = department.name;
      selectElement.appendChild(optionElement);
    });
  } catch (error) {
    console.error("Error fetching departments:", error);
  }
}

function del() {
  var button = document.getElementById("del-btn");
  var machineId = button.getAttribute("data-machine-id");

  fetch(`${BASE_URL}/machines/${machineId}/`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (response.ok) {
        console.log("Machine deleted successfully");
        window.location.href = "machine.html";
      } else {
        throw new Error("Failed to delete machine");
      }
    })
    .catch((error) => {
      console.error("Failed to delete machine:", error);
    });
}

// Edit button click event listener
function edit() {
  var button = document.getElementById("edit-btn");
  var machineId = button.getAttribute("data-machine-id");
  var newName = document.getElementById("machine-name").value;
  var newDepartment = document.getElementById("department").value;

  $.ajax({
    url: `${BASE_URL}/machines/` + machineId + `/`,
    method: "PUT",
    data: {
      name: newName,
      department: newDepartment,
    },
    success: function (response) {
      console.log("Machine edited successfully");

      window.location.href = "machine.html";
    },
    error: function (error) {
      console.error("Failed to edit machine:", error);
    },
  });
}

// Edit button click event listener
function add() {
  var machineName = document.getElementById("machine-name").value;
  var department = document.getElementById("department").value;

  $.ajax({
    url: `${BASE_URL}/machines/`,
    method: "POST",
    data: {
      name: machineName,
      department: department,
    },
    success: function (response) {
      console.log("Machine added successfully");
      window.location.href = "machine.html";
    },
    error: function (error) {
      console.error("Failed to add machine:", error);
    },
  });
}
