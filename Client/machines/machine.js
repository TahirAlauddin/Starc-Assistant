function redirect(destination, machineName, departmentName, id) {
  machineName = encodeURIComponent(machineName);
  departmentName = encodeURIComponent(departmentName);
  id = encodeURIComponent(id);

  window.location.href =
    destination +
    "?machine=" +
    machineName +
    "&department=" +
    departmentName +
    "&id=" +
    id;
}


function searchbar() {
  var input, filter;
  input = document.getElementById("searchInput");
  filter = input.value.trim();
  const url = `${BASE_URL}/machines/`;
  tableContent(url, page = "", param = filter);
}


document.addEventListener("DOMContentLoaded", function () {
  var url = `${BASE_URL}/machines/`;
  tableContent(url);
});

let activePage = 1;

function updatePagination(response, param = "") {
  const paginationContainer = document.getElementById("pagination-container");
  paginationContainer.innerHTML = "";

  const totalPages = Math.ceil(response.count / 5); // Assuming 5 items per page

  // Previous button
  const prevButton = document.createElement("a");
  prevButton.textContent = "Back";
  if (response.previous) {
    prevButton.addEventListener("click", function () {
      var page = getPageNumber(response.previous);
      tableContent(`${BASE_URL}/machines/`, page, param);
    });
  } else {
    prevButton.classList.add("disabled");
  }
  paginationContainer.appendChild(prevButton);

  // Page numbers
  for (let i = 1; i <= totalPages; i++) {
    const pageLink = document.createElement("a");
    pageLink.textContent = i;
    pageLink.addEventListener("click", function () {
      tableContent(`${BASE_URL}/machines/`, page = i, param = param);
      activePage = i;
      updatePagination(response, param);
    });
    if (i === activePage) {
      pageLink.classList.add("active");
    }
    paginationContainer.appendChild(pageLink);
  }

  // Next button
  const nextButton = document.createElement("a");
  nextButton.textContent = "Next";
  if (response.next) {
    nextButton.addEventListener("click", function () {
      var page = getPageNumber(response.next);
      tableContent(`${BASE_URL}/machines/`, page, param);
    });
  } else {
    nextButton.classList.add("disabled");
  }
  paginationContainer.appendChild(nextButton);
}

function getPageNumber(url) {
  var match = url.match(/page=(\d+)/);
  if (match && match[1]) {
    return parseInt(match[1]);
  }
  return 1;
}

function getCorrectUrl(url, page = "", param = "") {
  if (param !== "" || page !== "") {
    url += `?`;
    if (param !== "") {
      url += `search=${param}`;
    }
    if (page !== "") {
      url += `${param !== "" ? "&" : ""}page=${page}`;
    }
  }

  return url;
}

function addMachineRow(machineTableBody, machineName, departmentName, id) {
  // Create table row element
  var row = document.createElement("tr");

  // Create and append the machine name cell
  var nameCell = document.createElement("td");
  nameCell.textContent = machineName;
  row.appendChild(nameCell);

  // Create and append the department name cell
  var departmentCell = document.createElement("td");
  departmentCell.textContent = departmentName;
  row.appendChild(departmentCell);

  // Create and append the action cell
  var actionCell = document.createElement("td");
  actionCell.setAttribute("width", "13%");

  // Create edit link
  var editLink = document.createElement("a");
  editLink.href = "#";
  editLink.textContent = "Edit";
  editLink.className = "edit-button";
  editLink.dataset.machineId = id;
  editLink.onclick = function () {
    redirect("machine-detail.html", machineName, departmentName, id);
  };
  actionCell.appendChild(editLink);

  // Add space between buttons
  actionCell.appendChild(document.createTextNode(" "));

  // Create delete link
  var deleteLink = document.createElement("a");
  deleteLink.href = "#";
  deleteLink.textContent = "Delete";
  deleteLink.className = "delete-button";
  deleteLink.dataset.machineId = id;
  deleteLink.onclick = function () {
    del(id);
  };
  actionCell.appendChild(deleteLink);

  // Append the action cell to the row
  row.appendChild(actionCell);

  // Append the row to the table body
  machineTableBody.appendChild(row);
}

function tableContent(PageUrl, page = "", param = "") {
  PageUrl = getCorrectUrl(PageUrl, page, param);
  fetch(PageUrl)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to fetch machine list");
      }
      return response.json();
    })
    .then((response) => {
      if (response.results.length > 0) {
        var machineTableBody = document.getElementById("machineTableBody");
        machineTableBody.innerHTML = ""; // Clear the table body
        response.results.forEach(function (machine) {
          var machineName = machine.name;
          var departmentName = machine.department;
          var id = machine.id;

          addMachineRow(machineTableBody, machineName, departmentName, id);
        });
        updatePagination(response, param);
        if (PageUrl) {
          var page = getPageNumber(PageUrl);
          const paginationContainer = document.getElementById(
            "pagination-container"
          );
          var pageLinks = paginationContainer.querySelectorAll("a");
          pageLinks.forEach((link) => {
            link.classList.remove("active");
            if (parseInt(link.textContent) === page) {
              link.classList.add("active");
            }
          });
        }
      }
    })
    .catch((error) => {
      console.error("Error:", error.message);
    });
}

function del(machineId) {
  fetch(`${BASE_URL}/machines/${machineId}/`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      // Add any additional headers if needed
    },
    // Add any request body if needed
  })
    .then((response) => {
      if (response.ok) {
        console.log("Machine deleted successfully");
        window.location.href = "machine.html"; // Redirect or update UI as necessary
      } else {
        throw new Error("Failed to delete machine");
      }
    })
    .catch((error) => {
      console.error("Failed to delete machine:", error);
    });
}
