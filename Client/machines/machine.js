

function redirect(destination, machineName, departmentName, id) {
    machineName = encodeURIComponent(machineName);
    departmentName = encodeURIComponent(departmentName);
    id = encodeURIComponent(id);
    
    window.location.href = destination + '?machine=' + machineName + '&department=' + departmentName + '&id=' + id;
  }
  
// Function to handle row click event
function handleRowClick(event) {
  var row = event.target.closest('tr');

  var machineName = row.cells[0].innerText; 
  var departmentName = row.cells[1].innerText; 
 
  redirect('machine-detail.html', machineName, departmentName);
}

// Attach event listeners to table rows
var rows = document.querySelectorAll('.machine-sub-container table tbody tr');
rows.forEach(function(row) {
  row.addEventListener('click', handleRowClick);
});

function searchbar() {
    var input, filter;
    input = document.getElementById("searchInput");
    filter = input.value.trim();
    console.log("fil",filter);
    if(filter){
        // Construct the URL with the search term
        const url = `${BASE_URL}/machines/?search=${encodeURIComponent(filter)}`;

        fetch(url)
            .then(response => response.json())
            .then(data => {
                searched(data);
            })
            .catch(error => {
                    var row = document.getElementById("noResult");
                    row.innerHTML="no result found"
                
            });
    }else if(filter==''){
        const url = `${BASE_URL}/machines/`;
        tableContent(url)
        var row = document.getElementById("noResult");
        row.innerHTML=""

    }        
}
function searched(data) {
    var machineTableBody = document.getElementById('machineTableBody');
    machineTableBody.innerHTML = '';
    var machineName = data.name;
    var departmentName = data.department_name;
    var id = data.id;
    var addedDate = new Date(data.added_date);
    var formattedDate = addedDate.toISOString().slice(0, 10); // Format as YYYY-MM-DD
    machineTableBody.innerHTML +=
        '<tr>' +
        '<td>' + machineName + '</td>' +
        '<td>' + departmentName + '</td>' +
        '<td width="12%">' + formattedDate + '</td>' +
        '<td width="13%">' +
        '<a href="#" onclick="redirect(\'machine-detail.html\', \'' + machineName + '\', \'' + departmentName + '\', \'' + id + '\')" class="edit-button" data-machine-id="' + id + '">Edit</a>' +
        '<a href="#" class="delete-button" data-machine-id="' + id + '">Delete</a>' +
        '</td>' +
        '</tr>';
        const paginationContainer = document.getElementById('pagination-container');
        paginationContainer.innerHTML = '';

}





document.addEventListener("DOMContentLoaded", function() {
    
    var url = `${BASE_URL}/machines/`;
    tableContent(url);
  
    document.getElementById('machineTableBody').addEventListener('click', function(event) {
      if (event.target.classList.contains('delete-button')) {
        var machineId = event.target.getAttribute('data-machine-id');
        window.location.reload();
  
        // Perform AJAX request to Django view for deletion
        fetch(`${BASE_URL}/machines/` + machineId + `/delete/`, {
          method: 'POST'
        })
        .then(response => {
          if (response.ok) {
            console.log('Machine deleted successfully');
            window.location.reload();

          } else {
            console.error('Failed to delete machine:', response.statusText);
          }
        })
        .catch(error => {
          console.error('Failed to delete machine:', error);
        });
      }
    });
});
     



let activePage = 1; 

function updatePagination(response) {
  const paginationContainer = document.getElementById('pagination-container');
  paginationContainer.innerHTML = ''; // Clear existing pagination links

  const totalPages = Math.ceil(response.count / 5); // Assuming 5 items per page

  // Previous button
  const prevButton = document.createElement('a');
  prevButton.textContent = 'Back';
  if (response.previous) {
      prevButton.addEventListener('click', function() {
          tableContent(response.previous);
      });
  } else {
      prevButton.classList.add('disabled');
  }
  paginationContainer.appendChild(prevButton);

  // Page numbers
  for (let i = 1; i <= totalPages; i++) {
      const pageLink = document.createElement('a');
      pageLink.textContent = i;
      pageLink.addEventListener('click', function() {
          tableContent(`${BASE_URL}/machines/?page=${i}`);
          activePage = i;
          updatePagination(response);
      });
      if (i === activePage) {
          pageLink.classList.add('active');
      }
      paginationContainer.appendChild(pageLink);
  }

  // Next button
  const nextButton = document.createElement('a');
  nextButton.textContent = 'Next';
  if (response.next) {
      nextButton.addEventListener('click', function() {
          tableContent(response.next);
      });
 
  } else {
      nextButton.classList.add('disabled');
  }
  paginationContainer.appendChild(nextButton);
}

function getPageNumber(url) {
  var match = url.match(/page=(\d+)/);
  if (match && match[1]) {
      return parseInt(match[1]);
  }
  return 1; // Default to 1 if no page number found
}

function tableContent(PageUrl) {

    fetch(PageUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch machine list');
            }
            return response.json();
        })
        .then(response => {
            if (response.results.length > 0) {
                var machineTableBody = document.getElementById('machineTableBody');
                machineTableBody.innerHTML = ''; // Clear the table body
                response.results.forEach(function (machine) {
                    var machineName = machine.name;
                    var departmentName = machine.department_name;
                    var id = machine.id;
                    var addedDate = new Date(machine.added_date);
                    var formattedDate = addedDate.toISOString().slice(0, 10); // Format as YYYY-MM-DD
                    machineTableBody.innerHTML +=
                        '<tr>' +
                        '<td>' + machineName + '</td>' +
                        '<td>' + departmentName + '</td>' +
                        '<td width="12%">' + formattedDate + '</td>' +
                        '<td width="13%">' +
                        '<a href="#" onclick="redirect(\'machine-detail.html\', \'' + machineName + '\', \'' + departmentName + '\', \'' + id + '\')" class="edit-button" data-machine-id="' + id + '">Edit</a>' +
                        '<a href="#" class="delete-button" data-machine-id="' + id + '">Delete</a>' +
                        '</td>' +
                        '</tr>';
                });
                updatePagination(response);
                if (PageUrl) {
                    var page = getPageNumber(PageUrl);
                    const paginationContainer = document.getElementById('pagination-container');
                    var pageLinks = paginationContainer.querySelectorAll('a');
                    pageLinks.forEach(link => {
                        link.classList.remove('active');
                        if (parseInt(link.textContent) === page) {
                            link.classList.add('active');
                        }
                    });
                }
            } else {
                document.getElementById('noResultRow').style.display = 'block';
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Failed to fetch machine list.');
        });
}


document.addEventListener("DOMContentLoaded", async function () {
  // lLLet trainings = await fetchDataFromDatabase();  
  // loadTrainingSection(trainings);
  // setupPagination();
  let user = sessionStorage.getItem('isAdmin')

  if (user) {
  
    // If user is logged in as admin, don't show login page.
    document.getElementById('admin-panel-button').style.display = 'none'
  
    createAddButton()
    tornituraTab.setAttribute(
        "onclick",
        "redirectToPage('../admin/admin-panel.html?tab=tornitura')"
    );
    rettificheTab.setAttribute(
        "onclick",
        "redirectToPage('../admin/admin-panel.html?tab=rettifiche')"
    );
    qualitaTab.setAttribute(
        "onclick",
        "redirectToPage('../admin/admin-panel.html?tab=qualita')");
  } else {
    tornituraTab.setAttribute(
        "onclick",
        "redirectToPage('../chatbot/main.html?tab=tornitura')"
    );
    rettificheTab.setAttribute(
        "onclick",
        "redirectToPage('../chatbot/main.html?tab=rettifiche')"
    );
    qualitaTab.setAttribute(
        "onclick",
        "redirectToPage('../chatbot/main.html?tab=qualita')"
    );
  }
  
  
})