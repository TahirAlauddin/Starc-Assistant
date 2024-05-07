
let tornituraTab = document.getElementById("department-tornitura");
let rettificheTab = document.getElementById("department-rettifiche");
let qualitaTab = document.getElementById("department-qualita");
let trainingTab = document.getElementById("training-button");

var trainingObject = document.querySelector('#training-button object');

function redirect(destination, machineName, departmentName) {
  window.location.href = `${destination}?machine=${encodeURIComponent(machineName)}&department=${encodeURIComponent(departmentName)}`;
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
  var input, filter, table, tr, td, i, txtValue, found;
  input = document.getElementById("searchInput");
  filter = input.value.trim().toUpperCase();
  table = document.getElementById("machineTableBody");
  tr = table.getElementsByTagName("tr");
  found = false;
  if (filter === "") { 
      for (i = 0; i < tr.length; i++) {
          tr[i].style.display = "";
      }
      document.getElementById("noResultRow").style.display = "none";
  } else {
      for (i = 0; i < tr.length; i++) {
          td = tr[i].getElementsByTagName("td")[0];
          if (td) {
              txtValue = td.textContent || td.innerText;
              if (txtValue.toUpperCase().indexOf(filter) > -1) {
                  tr[i].style.display = ""; 
                  found = true;
              } else {
                  tr[i].style.display = "none"; 
              }
          }
      }
      document.getElementById("noResultRow").style.display = found ? "none" : "table-row";
  }
}
document.getElementById("searchInput").addEventListener("input", searchbar);

// Function to create a dictionary with page data and setup pagination
async function setupPagination() {

  let response = await fetch('http://localhost:8000/training-count/')
  let data = await response.json()


  // Assuming data is an array of items, and you decide how many items per page
  const itemsPerPage = 10; // Adjust based on your needs
  const totalPages = Math.ceil(data.count / itemsPerPage);


  // Function to generate pagination and attach event listeners
  async function generatePagination(currentPage, totalPages) {
    const container = document.getElementById('pagination-container');
    container.innerHTML = ''; // Clear existing pagination links

    if (totalPages > 1) {
      // Add 'Previous' button
      const prevPage = currentPage > 1 ? currentPage - 1 : 1;
      const prevButton = document.createElement('a');
      prevButton.href = '#';
      prevButton.textContent = 'Previous';
      prevButton.addEventListener('click', async function(e) {
          e.preventDefault();
          // Load the previous page
          document.getElementById('training-sub-container').innerHTML = ''; // Clear topics container
    
              // Fetch topics for clicked page
              let response = await fetch(`http://localhost:8000/training-with-file/?page=${prevPage}`);
              let trainings = await response.json()
              loadTrainingSection(trainings);
          generatePagination(prevPage, totalPages);
      });
      container.appendChild(prevButton);
    }

    // Determine range of page numbers to display
    let startPage = Math.max(currentPage - 2, 1);
    let endPage = Math.min(startPage + 4, totalPages);

    // Adjust startPage if we're at the last few pages
    if (currentPage > totalPages - 5) {
        startPage = Math.max(totalPages - 4, 1);
        endPage = totalPages;
    }

    // Generate page links within range
    for (let pageNumber = startPage; pageNumber <= endPage; pageNumber++) {
        const pageLink = document.createElement('a');
        pageLink.href = '#';
        pageLink.textContent = pageNumber;
        pageLink.className = pageNumber === currentPage ? 'active' : '';
        pageLink.addEventListener('click', async function(e) {
            e.preventDefault();
            document.getElementById('training-sub-container').innerHTML = ''; // Clear topics container

            // Fetch topics for clicked page
            let response = await fetch(`http://localhost:8000/training-with-file/?page=${pageNumber}`);
            let trainings = await response.json()
            loadTrainingSection(trainings);
            generatePagination(pageNumber, totalPages); // Regenerate pagination
        });
        container.appendChild(pageLink);
    }

    // Add 'Next' button
    if (totalPages > 1) {
      const nextPage = currentPage < totalPages ? currentPage + 1 : totalPages;
      const nextButton = document.createElement('a');
      nextButton.href = '#';
      nextButton.textContent = 'Next';
      nextButton.addEventListener('click', async function(e) {
          e.preventDefault();
          // Load the next page
          document.getElementById('training-sub-container').innerHTML = ''; // Clear topics container
    
              // Fetch topics for clicked page
              let response = await fetch(`http://localhost:8000/training-with-file/?page=${nextPage}`);
              let trainings = await response.json()
              loadTrainingSection(trainings);
          generatePagination(nextPage, totalPages);
      });
      container.appendChild(nextButton);
    }
  }

  // Call this function with the initial page and total pages from your API response
  generatePagination(1, totalPages); // Assuming 'totalPages' is defined somewhere in your code

}

document.addEventListener("DOMContentLoaded", function() {
  var url = 'http://localhost:8000/machines/';
  tableContent(url);
  $('#machineTableBody').on('click', '.delete-button', function() {
    var machineId = $(this).data('machine-id');
    
    // Perform AJAX request to Django view for deletion
    $.ajax({
        url: 'http://localhost:8000/machines/' + machineId + '/delete/',
        method: 'POST',  
        success: function(response) {
            console.log('Machine deleted successfully');
            window.location.href = 'machine.html';
        },
        error: function(error) {
            console.error('Failed to delete machine:', error);
        }
    });
    window.location.href = 'machine.html';
  });
})    



let activePage = 1; 

function updatePagination(response) {
  const paginationContainer = document.getElementById('pagination-container');
  paginationContainer.innerHTML = ''; // Clear existing pagination links

  const totalPages = Math.ceil(response.count / 3); // Assuming 3 items per page

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
          tableContent(`http://localhost:8000/machines/?page=${i}`);
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

function tableContent(PageUrl){
  $.ajax({
      url: PageUrl,  
      method: 'GET',
      success: function (response) {
          if (response.results.length > 0) {
              $('#machineTableBody').empty();
              response.results.forEach(function (machine) {
                  var machineName = machine.name; 
                  var departmentName = machine.department_name;
                  var id = machine.id;
                  var addedDate = new Date(machine.added_date);

                  // Get the date parts
                  var year = addedDate.getFullYear();
                  var month = (addedDate.getMonth() + 1).toString().padStart(2, '0');
                  var day = addedDate.getDate().toString().padStart(2, '0'); 

                  // Format the date as YYYY-MM-DD
                  var formattedDate = year + '-' + month + '-' + day;

                  $('#machineTableBody').append(
                      '<tr>' +
                      '<td>' + machineName + '</td>' +
                      '<td>' + departmentName + '</td>' +
                      '<td>' + formattedDate + '</td>' +
                      '<td width="15%">' +
                      '<a href="#" onclick="redirect(\'machine-detail.html\', \'' + machineName + '\', \'' + departmentName + '\', \'' + id + '\')" class="edit-button" data-machine-id="{{ \'' + machine.id + ' \' }}">Edit</a>' +
                      '<a href="#" class="delete-button" data-machine-id='+ machine.id +'>Delete</a>' +
                      '</td>' +
                      '</tr>'
                  );
                  updatePagination(response);
              });
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
              $('#noResultRow').show();
          }
      },
      error: function () {
          alert('Failed to fetch machine list.');
      }
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