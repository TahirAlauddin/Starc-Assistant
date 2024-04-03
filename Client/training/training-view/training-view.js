// Object to track file state
const fileState = {
  addedFiles: [],
  removedFiles: [],
  unchangedFiles: []
}
let uploadedFiles = []

async function showMessage(message, type = 'success', duration = 3000) {
  const container = document.getElementById('message-container');
  container.textContent = message;
  container.className = type; // Apply 'success' or 'error' class based on the type
  container.style.display = 'block';

  // Center the message container horizontally
  container.style.left = '50%';
  container.style.transform = 'translateX(-50%)';

  // Automatically hide the message after 'duration' milliseconds
  setTimeout(() => {
      container.style.display = 'none';
  }, duration);
}

async function updateTraining(trainingId) {
// , updatedTitle, updatedContent, addedFiles, removedFiles) {
  let updatedContent = document.getElementById('content').textContent;
  let updatedTitle = document.getElementById('title').textContent;
  
  try {
    await updateTrainingData(trainingId, updatedTitle, updatedContent);
    await updateTrainingFiles(trainingId, fileState.addedFiles, fileState.removedFiles);
    console.log("Training updated successfully.");
  } catch (error) {
    console.error("An error occurred during the update:", error);
  }
}

async function updateTrainingData(trainingId, updatedTitle, updatedContent) {
  const updateResponse = await fetch(`http://localhost:8000/training/${trainingId}/`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: updatedTitle,
      content: updatedContent
    })
  });

  if (!updateResponse.ok) {
    throw new Error(`HTTP error! Status: ${updateResponse.status}`);
  }
}

async function updateTrainingFiles(trainingId, addedFiles, removedFiles) {
  const formData = new FormData();
  formData.append('trainingId', trainingId);

  // Append added files
  addedFiles.forEach(file => {
    formData.append('addedFiles', file);
  });

  // Append removed file IDs
  removedFiles.forEach(fileId => {
    formData.append('removedFiles', fileId);
  });

  const response = await fetch(`http://localhost:8000/training/${trainingId}/training-files-bulk/`, {
    method: 'POST',
    body: formData
  });

  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }
}

function uploadFile(trainingId) {
  return async function (file) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('training', trainingId);

    const response = await fetch(`http://localhost:8000/training/${trainingId}/training-files/`, {
      method: 'POST',
      headers: {
        // 'Authorization': 'Bearer <Your Access Token Here>',
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
  };
}

async function saveTraining() {
  let title = document.getElementById('title').textContent;
  let content = document.getElementById('content').textContent;


  let trainingResponse = await fetch(`http://localhost:8000/training/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: title,
      content: content
    })
  });

  if (!trainingResponse.ok) {
    throw new Error(`HTTP error! Status: ${trainingResponse.status}`);
  }
  showMessage('Successfully Added Training', 'success')

  const training = await trainingResponse.json();
  await saveTrainingFiles(training.id)
  return training.id;
}

async function saveTrainingFiles(trainingId) {
  let fileUploadPromises = uploadedFiles.map(async file => {
    let formData = new FormData();
    formData.append('file', file);
    formData.append('training', trainingId);

    return await fetch(`http://localhost:8000/training/${trainingId}/training-files/`, {
      method: 'POST',
      headers: {
        // 'Authorization': 'Bearer <Your Access Token Here>',
      },
      body: formData
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    });
  });

  try {
    await Promise.all(fileUploadPromises);
    console.log("All files have been successfully uploaded.");
  } catch (error) {
    console.error("An error occurred during the file upload:", error);
  }
}

function populateData(id) {
  
  // Reset file state
  fileState.addedFiles = [];
  fileState.removedFiles = [];
  fileState.unchangedFiles = [];

  fetch('http://localhost:8000/training/' + id)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    
    .then(data => {

      document.getElementById('title').textContent = data.title;
      document.getElementById('content').textContent = data.content;

      data.files.forEach(fileUrl => {
        fetch(fileUrl)
          .then(response => response.json())
          .then(fileData => {
            // Display each media file using the 'file' attribute in the response
            console.log(fileData)
            displayMedia(fileData.file, fileData.id);

            // Check if file already exists in fileState. If not, mark as unchanged
            fileState.unchangedFiles.push(fileData.id);
              
          })
          .catch(error => {
            console.error('Error fetching file details:', error);
          });
      });
    })
    .catch(error => {
      console.error('There has been a problem with your fetch operation:', error);
    });
}

function createMediaDiv() {
  const mediaContainer = document.createElement('div');
  mediaContainer.id = 'media-container';
  mediaContainer.className = 'center-aligned-flex row-flex';
  mediaContainer.style.display = 'flex';
  mediaContainer.style.flexWrap = 'wrap';
  mediaContainer.style.justifyContent = 'center';
  mediaContainer.style.alignItems = 'center';
  mediaContainer.style.borderRadius = '1rem';
  document.getElementById('training-vids').appendChild(mediaContainer); // This appends the mediaContainer to the body. Append to a different element if necessary.
  return mediaContainer
}

function openPopup(src, fileType) {

  const overlay = document.createElement('div');
  overlay.className = 'popup-overlay fadeIn';
  
  const content = document.createElement('div');
  content.className = 'popup-content';

  let theDivElement;
  
  if (fileType === 'image') {
    const img = document.createElement('img');
    theDivElement = img;
    img.src = src;
    img.style.maxWidth = '80vw';
    img.style.maxHeight = '80vh';
    
    // img.style.position = 'absolute';
    // img.style.zIndex = '1000000';
    // img.style.top = '5%';
    // img.style.right = '10%';

    content.appendChild(img);
  } else if (fileType === 'video') {
    const video = document.createElement('video');
    theDivElement = video;
    video.src = src;
    video.controls = true;
    video.style.maxWidth = '90%';
    video.style.maxHeight = '90%';
    content.appendChild(video);
  } else if (fileType === 'pdf') {
    // PDFs cannot be easily displayed in a popup like images/videos.
    // Redirect or open in a new tab instead.
    window.open(src, '_blank');
    return;
  } else {
    showMessage("Unknown Error: filetype neither image, video nor pdf", "error")
    return
  }
  
  const closeButton = document.createElement('button');
  closeButton.textContent = '×';
  closeButton.className = 'close-button-popup';
  // closeButton.style.
  // theDivElement.width;
  closeButton.onclick = function() {
    document.body.classList.remove('blurred');
    overlay.remove();
  };
  
  content.appendChild(closeButton);
  overlay.appendChild(content);
  document.body.appendChild(overlay);
  document.body.classList.add('blurred');
  
  overlay.style.display = 'flex'; // Show the overlay
}

function displayMedia(mediaSrc, file) {

  console.log(fileState)
  // Define video formats to check
  const videoFormats = ['.mp4', '.mov', '.avi', '.wmv']; // Add more formats as needed
  let imageElement;
  const mediaContainer = createMediaDiv()
  let mediaItem;
  // Check if mediaSrc contains a video file
  if (mediaSrc && videoFormats.some(format => mediaSrc.endsWith(format))) {

    // Create the video element
    const videoElement = document.createElement('video');
    videoElement.src = mediaSrc;
    videoElement.controls = true;    
    videoElement.style.width = '100%';
    videoElement.style.height = '100%';
    videoElement.style.objectFit = 'cover'; // Ensures the video fills the container
    videoElement.style.borderRadius = '1rem'
    videoElement.classList.add('media-video'); // Use class for styles

    // Append the video element to the container
    mediaContainer.appendChild(videoElement)

    videoElement.addEventListener('click', function() {
      const fileType = 'video'; // Assuming 'image' for now, but this could be 'video' or 'pdf'
      const src = this.src; // Source of the clicked media
      console.log(src)
      openPopup(src, fileType);
    });

    videoElement.controls = false;
    videoElement.classList.add('video-thumbnail');
    videoElement.addEventListener('play', function(e) {
      e.preventDefault(); // Prevent playing
      // If the video starts playing, pause it right away
      if (!this.paused) {
        this.pause();
      }
    });
    
    videoElement.addEventListener('loadeddata', function () {
      this.currentTime = this.duration / 2; // Set the thumbnail to be in the middle of the video
    });

    mediaItem = videoElement;

  } else if (mediaSrc && mediaSrc.toLowerCase().endsWith('.pdf')) {
    var canvas = document.createElement('canvas');
    mediaItem = canvas;
    // Assuming mediaSrc is your PDF file URL
    pdfjsLib.getDocument(mediaSrc).promise.then(function(pdf) {
      pdf.getPage(1).then(function(page) {
        var viewport = page.getViewport({scale: 0.8});
        var ctx = canvas.getContext('2d');
        canvas.height = viewport.height;
        // canvas.width = viewport.width  ;

        var renderContext = {
          canvasContext: ctx,
          viewport: viewport
        };

        page.render(renderContext).promise.then(function() {
          // Append the canvas with the PDF page to your media container
          mediaContainer.appendChild(canvas);
          // Optional: Apply styles to make it look like an image preview
          canvas.style.width = '12rem';
          canvas.style.objectFit = 'cover';
          canvas.style.height = 'auto';
          canvas.onclick = () => window.open(mediaSrc, '_blank'); // Open PDF in new tab on click
        });
      });
    }).catch(function(error) {
      console.log('Error: ' + error);
    });


  } else if (mediaSrc) {
    mediaContainer.innerHTML = ''; // Clear previous media content
    // Create the image element
    imageElement = document.createElement('img');
    imageElement.src = mediaSrc;
    imageElement.style.width = '100%';
    imageElement.style.height = '100%';
    mediaContainer.appendChild(imageElement);

    mediaItem = imageElement;

  }
    
  // Add remove button
  const removeButton = document.createElement('button');
  removeButton.innerHTML = '&times;'; // Add cross symbol
  removeButton.className = 'remove-button';
  removeButton.addEventListener('click', function() {
    removeFile(file);
    mediaContainer.remove(); // Remove the media item from the UI
  });
  mediaContainer.appendChild(removeButton);

  if (imageElement) {
    imageElement.addEventListener('click', function() {
      let src = this.src; // Source of the clicked media
      let fileType;
      if (mediaSrc.toLowerCase().endsWith('.pdf')) {
        src = mediaSrc
        fileType = 'pdf'; 
      }
      else {
        fileType = 'image'; 
      }
      openPopup(src, fileType);
    });
  }
}

  // Function to remove file from fileState
  function removeFile(file) {
    let index;
    if (typeof file === File) {
      index = fileState.addedFiles.indexOf(file)
      if (index !== -1)
        fileState.addedFiles.splice(index, 1);
    } else {
      index = fileState.unchangedFiles.indexOf(file);
      if (index !== -1) {
        fileState.unchangedFiles.splice(index, 1);
        fileState.removedFiles.push(file);
      }
    }

}


function createLogoutButton() {

  let mainBody = document.querySelector(".training-heading");
  // Create the main div
  const logoutDiv = document.createElement('div');
  logoutDiv.className = 'logout-button center-aligned-flex';
  logoutDiv.setAttribute('onclick', 'sendLogOutRequest()');
  logoutDiv.textContent = 'Log Out';

  mainBody.appendChild(logoutDiv)
}

function resetSidebar() {
  const newWidth = window.innerWidth;
  
  if (newWidth < 680) {
    sidebar.style.width = "0";
    arrow.style.left = "0"
    arrow.textContent = '>';
  } 
  else {
    sidebar.style.cssText = "";
  }
}

// Function to generate video thumbnail and grid item for uploaded videos
function generateVideoGrid(file) {
    const objectURL = URL.createObjectURL(file);

    const videoGrid = document.querySelector(".training-vids");
    const addNewVideoDiv = document.getElementById("add-training-cards-container");

    // Create the video thumbnail container
    const thumbnail = document.createElement("div");

    // Create the video element for the thumbnail
    const videoThumbnail = document.createElement("video");
    videoThumbnail.src = objectURL;
    videoThumbnail.controls = true;
    videoThumbnail.style = 'width: 9.5rem; height: 10rem';
    videoThumbnail.classList.add('video-thumbnail');
    videoThumbnail.addEventListener('loadeddata', function () {
      this.currentTime = this.duration / 2; // Set the thumbnail to be in the middle of the video
    });

    thumbnail.appendChild(videoThumbnail);
    videoGrid.insertBefore(thumbnail, addNewVideoDiv);
}

async function deleteTraining(id) {
  try {
    const response = await fetch(`http://localhost:8000/training/${id}/`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    console.log("Training deleted successfully.");
    showMessage("Training deleted successfully.", 'success')
    setTimeout(() => {
      location.reload()
    }, 500);
  } catch (error) {
    console.error("Failed to delete training:", error);
    showMessage(`${error}`, 'error')
  }  
}

function addDeleteButton(id) {
  let container = document.getElementById('save-training-button-container')
  let div = document.createElement('div');
  div.classList.add('center-aligned-flex', 'save-training-button');
  div.id = 'delete-training-button';
  div.style.background = 'tomato';
  div.textContent = 'Delete';
  div.addEventListener('click', () => {
      deleteTraining(id);
  });
  container.appendChild(div);
}

// Function to apply paste event listeners
function applyPasteEventListeners() {
  // document.querySelectorAll('div[contenteditable="true"]').forEach(div => {
  document.getElementById('title').addEventListener('paste', function(e) {
      e.preventDefault();
      const text = (e.clipboardData || window.clipboardData).getData('text');
      document.execCommand('insertHTML', false, text);
    });
}


document.addEventListener("DOMContentLoaded", function () {

  applyPasteEventListeners()
  
  let user = sessionStorage.getItem('isAdmin')
  // Grab the .edit-para div and .training-vids-para
  // const editTitle = document.getElementById("edit-title");
  const editPara = document.getElementById("edit-para");
  const paraDiv = document.querySelector(".training-vids-para");
  const titleDiv = document.querySelector(".training-vids-title");
  
  let buttonContainer = document.getElementById("save-training-button-container")

  // TODO: REMOVE THIS LINE
  // if (true) {
  if (user) {
    document
      .getElementById("add-training-cards-container")
      .addEventListener("click", function () {
        // Programmatically trigger the hidden file input
        document.getElementById("fileInput").click();
      });
      titleDiv.style.backgroundColor = 'white';
  } else {
    document.getElementById("add-training-cards-container").remove()
    buttonContainer.remove()
  }

  // Check if the user is an admin
  let tornituraTab = document.getElementById("department-tornitura");
  let rettificheTab = document.getElementById("department-rettifiche");
  let qualitaTab = document.getElementById("department-qualita");


  if (user) {
    tornituraTab.setAttribute(
      "onclick",
      "redirectToPage('../../admin/admin-panel.html?tab=tornitura')"
    );
    rettificheTab.setAttribute(
      "onclick",
      "redirectToPage('../../admin/admin-panel.html?tab=rettifiche')"
    );
    qualitaTab.setAttribute(
      "onclick",
      "redirectToPage('../../admin/admin-panel.html?tab=qualita')");
  }
  else {
    tornituraTab.setAttribute(
      "onclick",
      "redirectToPage('../../chatbot/main.html?tab=tornitura')"
    );
    rettificheTab.setAttribute(
      "onclick",
      "redirectToPage('../../chatbot/main.html?tab=rettifiche')"
    );
    qualitaTab.setAttribute(
      "onclick",
      "redirectToPage('../../chatbot/main.html?tab=qualita')");
  }


  // Watch for video uploads
  document.getElementById('fileInput').addEventListener('change', function () {
    Array.from(this.files).forEach(file => {
      displayMedia(file.path, file);
      uploadedFiles.push(file)
      fileState.addedFiles.push(file)
    });
    this.value = ''
  });

  // Check whether showing an existing Training object or trying to create a new one
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const id = urlParams.get('id');

  // Decision making (update or create)
  if (id) {
    // Update Logic is going to be implemented here
    addDeleteButton(id)
    populateData(id)
    document.getElementById('save-training-button').addEventListener('click', () => {
      updateTraining(id)
    })
  }

});

let trainingTab = document.getElementById("training-button");
var trainingObject = document.querySelector('#training-button object');

document.addEventListener("DOMContentLoaded", function () {
  trainingTab.classList.add("selected-department-box")
  trainingObject.setAttribute('data', '../../images/Training-Selected.svg');
})

// const sidebar = document.querySelector('.sidebar');
// const arrow = document.createElement('div');
arrow.classList.add('arrow');
arrow.innerHTML = '>'; 

document.body.appendChild(arrow);

window.addEventListener('resize', function() {
  resetSidebar();
});


// JavaScript to handle arrow click and toggle sidebar visibility
document.addEventListener('DOMContentLoaded', function () {

  // Toggle sidebar visibility on arrow click
  arrow.addEventListener('click', function () {
    sidebar.style.width = sidebar.style.width === '0px' ? '130px' : '0px';
    arrow.style.left = arrow.style.left === '0px' ? '130px' : '0px';
    arrow.textContent = arrow.textContent === '>' ? '<' : '>';
  });
  resetSidebar();

  document.getElementById('save-training-button').addEventListener('click', () => {
    saveTraining()
  })

});
  


