
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