const response = '';
const trainings = '';

let user = sessionStorage.getItem('isAdmin')


// Call this function when the user clicks the "Upload" button in the modal
function uploadFiles() {
  // Retrieve data from the modal form
  const title = document.getElementById('title-input').value;
  const content = document.getElementById('content-input').value;
  const files = document.getElementById('file-input').files;
  const formData = new FormData();
  formData.append('title', title);
  formData.append('content', content);
  for (let i = 0; i < files.length; i++) {
    formData.append('files', files[i]);
  }

  // Make a POST request to your backend endpoint using Axios
  axios.post('http://localhost:8000/upload/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
  .then(response => {
    console.log('Files uploaded successfully');
    // Optionally handle response from the backend
  })
  .catch(error => {
    console.error('Error uploading files:', error);
    // Handle errors
  })
  .finally(() => {
    closeModal();
  });
}
    

function generateThumbnail(url) {
  // Determine if the URL is for an image or a video based on file extension
  if (url.match(/\.(jpeg|jpg|gif|png)$/)) {
    // It's an image, so return the URL directly
    return Promise.resolve(url);
  } else if (url.match(/\.(mp4|webm|ogg)$/)) {
    // It's a video, so generate a thumbnail
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');

      video.setAttribute('src', url);
      video.load();
      video.addEventListener('loadeddata', () => {
        try {
          // Set canvas size to video size
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;

          // Draw the video frame to canvas
          context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);

          // Convert canvas to image URL and resolve promise
          resolve(canvas.toDataURL('image/png'));
        } catch (e) {
          reject(e);
        }
      }, false);

      video.addEventListener('error', (e) => {
        reject(e);
      });
    });
  } else {
    // URL does not match known image or video extensions
    return Promise.reject(new Error('URL must be for an image or a video file.'));
  }
}


function useDocumentPlaceholder(file) {
  // Assuming you have a parent container with the class 'documents-container'
  const container = document.querySelector('.training-vids');
  let addNewVideoDiv = document.getElementById(
    "add-training-cards-container"
  );

  // Create the main div
  const div = document.createElement("div");
  div.className = "training-document center-aligned-flex column-flex";

  // Create the remove-video div
  const removeDiv = document.createElement("div");
  removeDiv.className = "remove-video";

  // Create the img inside the remove-video div
  const removeImg = document.createElement("img");
  removeImg.src = "images/substract.png";
  removeImg.alt = "";

  // Append the remove image to the remove-video div
  removeDiv.appendChild(removeImg);

  // Create the document thumbnail
  const docImg = document.createElement("img");
  docImg.src = "images/document-thumbnail.png";
  docImg.alt = "";

  // Create the document name
  const p = document.createElement("p");
  const u = document.createElement("u");

  // Replace 'Document Name' with the name of the uploaded file
  u.textContent = file.name;

  p.appendChild(u);

  // Append all child elements to the main div
  div.appendChild(removeDiv);
  div.appendChild(docImg);
  div.appendChild(p);

  // Append the main div to the parent container
  container.insertBefore(div, addNewVideoDiv);
}


// Check if the user is an admin
let tornituraTab = document.getElementById("department-tornitura");
let rettificheTab = document.getElementById("department-rettifiche");
let qualitaTab = document.getElementById("department-qualita");
let trainingTab = document.getElementById("training-button");

var trainingObject = document.querySelector('#training-button object');

function createLogoutButton() {

  let mainBody = document.querySelector(".training-heading");
  // Create the main div
  const logoutDiv = document.createElement('div');
  logoutDiv.className = 'logout-button center-aligned-flex';
  logoutDiv.setAttribute('onclick', 'sendLogOutRequest()');
  logoutDiv.textContent = 'Log Out';

  mainBody.appendChild(logoutDiv)
}


function createAddButton() {
  let mainBody = document.getElementById("training-sub-container");
  // Create the main container div
  const mainDiv = document.createElement('div');
  mainDiv.className = 'add-training-cards-container center-aligned-flex';
  mainDiv.setAttribute('onclick', 'redirectToPage("training-view/training-view.html")');

  // Create the nested div
  const nestedDiv = document.createElement('div');
  nestedDiv.className = 'add-training-cards center-aligned-flex column-flex';

  // Create the object element for the SVG
  const imgObject = document.createElement('img');
  imgObject.setAttribute('src', 'images/Add.png');

  // Create the paragraph element
  const paraDiv = document.createElement('div');
  paraDiv.className = 'add-training-cards-para';
  paraDiv.textContent = 'Add Videos and Documents';

  // Append elements to their respective parents
  nestedDiv.appendChild(imgObject);
  nestedDiv.appendChild(paraDiv);
  mainDiv.appendChild(nestedDiv);

  // Append the main div to the body or another container in the document
  mainBody.appendChild(mainDiv);
}

// Simulated function to fetch data from the database
async function fetchDataFromDatabase() {
  console.log("Fetching data")
  let response = await fetch('http://127.0.0.1:8000/training-with-file/')
  return await response.json();
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
        videoElement.src = 'http://localhost:8000' + training.file; // Set the source of the video
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
          image.src = 'http://localhost:8000' + training.file; // Set the source of the image
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

    trainings = trainings.results;
    trainings.forEach(training => {
      addTrainingItem(training)
    });
 
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

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
  trainingTab.classList.add("selected-department-box")
  trainingObject.setAttribute('data', '../images/Training-Selected.svg');
  let trainings = await fetchDataFromDatabase();  
  loadTrainingSection(trainings);
  setupPagination();

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