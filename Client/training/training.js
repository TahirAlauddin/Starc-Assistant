const response = '';
const trainings = '';

let user = sessionStorage.getItem('isAdmin')

let logoutButton = document.getElementById('logout-button')
if (!user) {
  logoutButton.remove()
}

// Check if the user is an admin
let tornituraTab = document.getElementById("department-tornitura");
let rettificheTab = document.getElementById("department-rettifiche");
let qualitaTab = document.getElementById("department-qualita");
let trainingTab = document.getElementById("training-button");

var trainingObject = document.querySelector('#training-button object');


// Simulated function to fetch data from the database
async function fetchDataFromDatabase() {
  try {
    let response = await fetch(`${BASE_URL}/training-with-file/`);
    if (!response.ok) {
      // The server responded with a status code that falls out of the range of 2xx
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    showMessage(error.message, 'error')
    console.error('Fetch error:', error.message);
  }
}
  

// Adjusted function to add training items to the HTML
function addTrainingItem(training) {
    const trainingContainer = document.getElementById('training-sub-container');

    const trainingCard = document.createElement('div');
    trainingCard.classList.add('training-cards', 'column-flex');
    const newPageURL = `training-view/training-view.html?id=${training.id}`;
    trainingCard.onclick = function () {
        redirectToPage(newPageURL);
    };

    if (training.file.endsWith('.mp4') || training.file.endsWith('.avi') || training.file.endsWith('.mov')) {
        // If the file is a video
        const videoElement = document.createElement('video'); // Create the video element
        videoElement.src = `${BASE_URL}` + training.file; // Set the source of the video
        videoElement.controls = false; // Hide video controls
        videoElement.style.objectFit = 'cover'
        videoElement.style.width = '100%'; // Set the width of the video
        videoElement.style.height = '12rem'; // Set the height of the video
        trainingCard.appendChild(videoElement); // Append the video element

    } 
    else {
        // If the file is an image
        const image = document.createElement('img'); // Create the image element
        if (training.file.endsWith('.pdf')){
          image.src = '../images/pdf.png'
        }
        else{
          image.src = `${BASE_URL}` + training.file; // Set the source of the image
        }
        image.alt = ''; // Set alt text for the image
        image.style.width = '100%'; // Set the image width to fill its container
        image.style.height = '50%'

        // imageContainer.appendChild(image); // Append the image to its container
        trainingCard.appendChild(image); // Append the image container to the card
    }

    const contentContainer = document.createElement('div'); // Create a container for title and content
    const title = document.createElement('h2'); // Create heading element for title
    title.textContent = training.title; // Set title text
    title.style.fontWeight = 'bold'; // Make the title bold
    title.style.color = 'var(--primary-color)'; // Set text color to blue

    const para = document.createElement('p'); // Create a paragraph for content
    para.textContent = training.content;
    para.style.overflow = 'hidden'; // Hide overflow content
    para.style.color = 'var(--primary-color)'; // Set text color to blue

    contentContainer.appendChild(title); // Append title to the content container
    contentContainer.appendChild(para); // Append content to the content container

    trainingCard.appendChild(contentContainer); // Append the content container to the card
    trainingContainer.appendChild(trainingCard); // Append the card to the training container

}

async function loadTrainingSection(trainings) {
  try {
    const trainingContainer = document.getElementById('training-sub-container');
    trainingContainer.innerHTML = ''

      trainings.forEach(training => {
        addTrainingItem(training)
      });
 
  } catch (error) {
    showMessage(error.message, 'error')
    console.error('Error fetching data:', error);
  }
}
async function setupPagination() {
  let totalPages;
  try {
    let response = await fetch(`${BASE_URL}/training-count/`);
    if (!response.ok) {
      // If the response is not in the 2xx range, throw an error.
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    let data = await response.json();

    // Assuming data contains a property count which is the total number of items
    const itemsPerPage = 10; // Adjust based on your needs
    totalPages = Math.ceil(data.count / itemsPerPage);

  } catch (error) {
    console.error('Error setting up pagination:', error.message);
    showMessage(error.message, 'error') 
  }

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
          try {
            let response = await fetch(`${BASE_URL}/training-with-file/?page=${prevPage}`);
            if (!response.ok) {
              // If the response status is not in the 2xx range, throw an error.
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            let trainings = await response.json();
            // if (trainings.results) 
            if (trainings.results !== '' || trainings.results != undefined) {
              loadTrainingSection(trainings.results); // Assuming loadTrainingSection is defined elsewhere to update the UI
            }
          } catch (error) {
            console.error('Error fetching topics for page:', error.message);
            showMessage(error.message, 'error')
          }
        
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

            try {
              let response = await fetch(`${BASE_URL}/training-with-file/?page=${prevPage}`);
              if (!response.ok) {
                // If the response status is not in the 2xx range, throw an error.
                throw new Error(`HTTP error! status: ${response.status}`);
              }
              let trainings = await response.json();
              if (trainings.results !== '' || trainings.results != undefined) {
                loadTrainingSection(trainings.results); // Assuming loadTrainingSection is defined elsewhere to update the UI
              } 
            } catch (error) {
              console.error('Error fetching topics for page:', error.message);
              showMessage(error.message, 'error')
            }

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
              let response = await fetch(`${BASE_URL}/training-with-file/?page=${nextPage}`);
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

function setupNavigation() {
  
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
  
}

document.addEventListener("DOMContentLoaded", async function () {
  // Setup Navigation first
  setupNavigation()

  trainingTab.classList.add("selected-department-box")
  trainingObject.setAttribute('data', '../images/Training-Selected.svg');
  let trainings = await fetchDataFromDatabase();  
  if (trainings && trainings.results && trainings.results.length > 0) {
    loadTrainingSection(trainings.results); 
  }

  setupPagination();

  
})
