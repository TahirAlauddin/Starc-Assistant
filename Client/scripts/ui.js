function addRemoveImageButton(mediaContainer, file) {
  // Add remove button
  let user = sessionStorage.getItem('isAdmin')

  if (!user) {
    return
  }
  const removeButton = document.createElement('button');
  removeButton.innerHTML = '&times;'; // Add cross symbol
  removeButton.className = 'remove-button';
  removeButton.addEventListener('click', function() {
    removeFile(file);
    mediaContainer.remove(); // Remove the media item from the UI
  });
  mediaContainer.appendChild(removeButton);
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

function createLogoutButton() {

  let mainBody = document.querySelector(".training-heading");
  // Create the main div
  const logoutDiv = document.createElement('div');
  logoutDiv.className = 'logout-button center-aligned-flex';
  logoutDiv.setAttribute('onclick', 'sendLogOutRequest()');
  logoutDiv.textContent = 'Log Out';

  mainBody.appendChild(logoutDiv)
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

function displayMedia(mediaSrc, file) {
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
      
    addRemoveImageButton(mediaContainer, file)

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
