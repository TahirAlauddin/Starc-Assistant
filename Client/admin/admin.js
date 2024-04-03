let uploadedFiles = [];
let httpMethod = 'POST';
let isTrained = false;
const fileStates = {
  newFiles: [], // Array of File objects to be uploaded
  existingFiles: [], // Array of objects representing files from the server
  filesMarkedForDeletion: [], // Array of IDs for files to be deleted
};


function openPopup(src, fileType) {

  const overlay = document.createElement('div');
  overlay.className = 'popup-overlay fadeIn';
  
  const content = document.createElement('div');
  content.className = 'popup-content';
  
  if (fileType === 'image') {
    const img = document.createElement('img');
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
  }
  
  const closeButton = document.createElement('span');
  closeButton.textContent = '×';
  closeButton.className = 'close-button-popup';
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

function removeUploadedFile(div, file) {
  div.remove();
  // Assuming uploadedFiles is your list and div is the element to be removed
  uploadedFiles = uploadedFiles.filter(item => item !== file);
}


function displayMedia(mediaSrc) {
  // Define video formats to check
  const videoFormats = ['.mp4', '.mov', '.avi', '.wmv']; // Add more formats as needed
  let imageElement;
  const mediaContainer = createMediaDiv()
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
  

  } else if (mediaSrc && mediaSrc.toLowerCase().endsWith('.pdf')) {
    
    const mediaItemDiv = document.createElement('div')
    mediaItemDiv.classList.add('media-item'); // Use class for styles
    
    // Assuming mediaSrc is your PDF file URL
    pdfjsLib.getDocument(mediaSrc).promise.then(function(pdf) {
      pdf.getPage(1).then(function(page) {
        var viewport = page.getViewport({scale: 0.8});
        var canvas = document.createElement('canvas');
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
  }
  if (imageElement)
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


function useDocumentPlaceholder(file, fileSrc=null) {

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

  removeDiv.addEventListener("click", function() {
    removeUploadedFile(div, file)
  })


  // Create the img inside the remove-video div
  const removeImg = document.createElement("img");
  removeImg.src = "images/substract.png";
  removeImg.alt = "";

  // Append the remove image to the remove-video div
  removeDiv.appendChild(removeImg);
  
  let mediaSrc = fileSrc || file.path;
  const mediaItemDiv = document.createElement('div')
  mediaItemDiv.classList.add('media-item'); // Use class for styles

  // Create the document name
  const p = document.createElement("p");
  const u = document.createElement("u");
  
  // Replace 'Document Name' with the name of the uploaded file
  u.textContent = file.name;
  p.appendChild(u);

  
  // Assuming mediaSrc is your PDF file URL
  pdfjsLib.getDocument(mediaSrc).promise.then(function(pdf) {
    pdf.getPage(1).then(function(page) {
      var viewport = page.getViewport({scale: 0.8});
      var canvas = document.createElement('canvas');
      var ctx = canvas.getContext('2d');
      canvas.height = viewport.height / 2;
      canvas.width = viewport.width  ;

      var renderContext = {
        canvasContext: ctx,
        viewport: viewport
      };

      page.render(renderContext).promise.then(function() {
        // Append the canvas with the PDF page to your media container
        div.appendChild(canvas);
        // Optional: Apply styles to make it look like an image preview
        canvas.style.width = '10rem';
        canvas.style.objectFit = 'cover';
        canvas.style.height = '8rem';
        div.appendChild(removeDiv);
        div.appendChild(p);
        canvas.onclick = () => window.open(mediaSrc, '_blank'); // Open PDF in new tab on click
      });
    });
  }).catch(function(error) {
    console.log('Error: ' + error);
  });


  // Append the main div to the parent container
  container.insertBefore(div, addNewVideoDiv);
}

var perfEntries = performance.getEntriesByType("navigation");

if (perfEntries[0].type === "back_forward") {
  location.reload();
}

let uploadedVideos = [];

// Get references to the containers, buttons, and input fields
const questionsContainer = document.getElementById("questions-container");
const answersContainer = document.getElementById("answers-container");
const questionInput = document.getElementById("question-input");
const answerInput = document.getElementById("answer-input");

answerInput.addEventListener("keyup", function (event) {
  if (event.key === "Enter") {
    addAnswer();
  }
});

questionInput.addEventListener("keyup", function (event) {
  if (event.key === "Enter") {
    addQuestion();
  }
});

function createQuestionElement(text, img) {
  // Create a new div element with the specified structure
  const questionDiv = document.createElement("div");
  questionDiv.className = "center-aligned-flex question";

  // Create and append the image element
  const imgElement = document.createElement("img");
  imgElement.src = "images/" + img + ".png";
  imgElement.alt = "";
  questionDiv.appendChild(imgElement);


  // Create and append the "break" div
  const breakDiv1 = document.createElement("div");
  breakDiv1.className = "break";
  breakDiv1.textContent = "|";
  questionDiv.appendChild(breakDiv1);

  // Create and append the question text div
  const questionTextDiv = document.createElement("div");
  if (img === "idea") {
    questionTextDiv.className = "question-text";
  }
  else {
    questionTextDiv.className = "answer-text";
  }
  questionTextDiv.classList.add("center-aligned-flex");
  questionTextDiv.textContent = text;
  questionDiv.appendChild(questionTextDiv);

  // Create and append the second "break" div
  const breakDiv2 = document.createElement("div");
  breakDiv2.className = "break";
  breakDiv2.textContent = "|";
  questionDiv.appendChild(breakDiv2);

  // Create and append the "remove-answer" div with an image
  const removeAnswerDiv = document.createElement("div");
  removeAnswerDiv.className = "remove-answer";

  const removeImgElement = document.createElement("img");
  removeImgElement.src = "images/substract.png";
  removeImgElement.alt = "";
  removeAnswerDiv.appendChild(removeImgElement);

  // Add the event listener to remove the question or answer
  removeAnswerDiv.addEventListener("click", function () {
    questionDiv.remove();
  });


  questionDiv.appendChild(removeAnswerDiv);

  return questionDiv;
}

function cleanInputFields() {

  // let labelInput = document.getElementById("label-input")
  // labelInput.value = '';
  // answersContainer.innerHTML = ''
  // questionsContainer.innerHTML = ''

  location.reload()
  // let fileDiv = document.getElementById('training-vids')
  // fileDiv
  // .addEventListener("click", function () {
  //   // Programmatically trigger the hidden file input
  //   document.getElementById("fileInput").click();
  // });
}

// Function to add a new question
function addQuestion() {
  const questionText = questionInput.value.trim();
  if (questionText !== "") {
    const questionDiv = createQuestionElement(questionText, "idea");
    questionsContainer.appendChild(questionDiv);

    // Clear the input field and hide it
    questionInput.value = "";
  }
}

// Function to add a new answer
function addAnswer() {
  const answerText = answerInput.value.trim();
  if (answerText !== "") {
    const answerDiv = createQuestionElement(answerText, "message-square");
    answersContainer.appendChild(answerDiv);

    // Clear the input field and hide it
    answerInput.value = "";
  }
}

async function saveFile(file, topicId) {
  if (!file || !topicId) {
    console.error('File or topic ID is missing.');
    return false; // Indicates failure
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('topic', topicId);

  try {
    const response = await fetch(`http://localhost:8000/topic/${topicId}/topic-files/`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text() || 'Server response not OK';
      console.error('Error uploading VideoGuide:', errorText);
      showMessage(errorText, 'error');
      return false; // Indicates failure
    }

    const data = await response.json();
    console.log('VideoGuide uploaded successfully!', data);
    return true; // Indicates success
  } catch (error) {
    console.error('Error uploading VideoGuide:', error);
    showMessage(error.toString(), 'error');
    return false; // Indicates failure
  }
}

  
function deleteTopic(topicId) {
  showMessage("Deleting Topic", "information");

  fetch(`http://localhost:8000/topic/${topicId}`, {
    method: 'DELETE'
  })
  .then(response => {
    if (!response.ok) {
      console.log('Error deleting topic:', response.statusText);
      showMessage('Error deleting topic:' + response.statusText, 'error');
      throw new Error('Network response was not ok.');
    }
    console.log(response)
    if (response.status == 204) {
      console.log('Topic deleted successfully!');
      showMessage('Topic deleted successfully!', 'success');


    } else {
      showMessage('Failed to delete topic!', 'error');
    }
    setTimeout(() => {
      redirectToPage('previous-topic/previous-topic.html'+'?tab='+selectedDepartment)
    }, 500);

  })
  .catch(error => {
    console.error('Failed to delete topic:', error);
  });
}

async function saveTopic() {

  if (isTrained) {
    showMessage('Cannot save the topic that is used to train the model', 'error')
    return
  }
  showMessage("Saving Topic", "information")

  const questions = document.querySelectorAll(".question-text");
  const answers = document.querySelectorAll(".answer-text");
  const label = document.getElementById("label-input")
  let selectedMachine = null;
  const selectElement = document.getElementById("custom-dropdown");
  
  let answers_data = [];
  let questions_data = [];
  let files = [];
  
  answers.forEach(answer=>{
    answers_data.push(answer.textContent);
  });
  questions.forEach(question=>{
    questions_data.push(question.textContent);
  });

  
  const data = {};
  data["label"]= label.value.trim();  
  data["machine"] = selectedMachine ? selectedMachine : selectElement[0].value;
  data["questions"] = questions_data;
  data["answers"] = answers_data;
  

  await fetch('http://localhost:8000/upload-data/', {
    method: httpMethod,
    body: JSON.stringify(data)
  })
  .then(response => {
    // Check if the response is ok (status in the range 200-299)
    if (!response.ok) {
      // Throw an error for any response not in the 200 range, including 200 status code check

      console.log('Error uploading data:', data.message || 'Unknown error');
      showMessage('Error saving data:' + data.message || 'Unknown error', 'error')
      throw new Error('Network response was not ok: ' + response.statusText);
    }

    return response.json(); // We can safely parse JSON now
  })
  .then(async data => {
    // Assuming 'data' contains a property 'status_code' to check for successful operation
    console.log('Topic saved successfully!');
    showMessage('Topic saved successfully!', 'success');
    
      
    if (uploadedFiles && data.topic && data.topic.id) {
      const results = await Promise.all(uploadedFiles.map(file => saveFile(file, data.topic.id)));
      // Check if all uploads were successful
      const allUploadsSuccessful = results.every(result => result === true);
      if (allUploadsSuccessful) {
        // All uploads successful, reinitialize uploadedVideos
        uploadedVideos = [];
      }
      return allUploadsSuccessful;
    } else {
      // No files to upload, treat as successful
      uploadedVideos = [];
      return true;
    }
  })
  .then((allUploadsSuccessful) => {
    // Now you have a flag indicating the success of all uploads
    if (allUploadsSuccessful) {
      // All uploads were successful
      console.log('All files have been successfully uploaded');
    } else {
      // At least one upload failed
      console.log('Some files might not have been uploaded successfully');
    }
    // cleanInputFields(); // You can call this if you still want to clean the fields regardless of success
  })
  .catch(error => {
    console.error('Error in the file upload process:', error);
    showMessage('Error in saving topic or uploading files!', 'error');
    // TODO: update the error message
  });
  // TODO: Ensure 'cleanInputFields' is defined and properly resets the input fields.
  // TODO: Ensure 'showMessage' is defined and capable of displaying messages to the user.
  
}


// Function to generate video thumbnail and grid item for uploaded videos
function generateVideoGrid(file) {
  // const objectURL = URL.createObjectURL(file);
  const objectURL = file.src;

  const videoGrid = document.querySelector(".training-vids");
  const addNewVideoDiv = document.getElementById("add-training-cards-container");

  // Create the video thumbnail container
  const div = document.createElement("div");

  div.className = "training-document center-aligned-flex column-flex";

  // Create the remove-video div
  const removeDiv = document.createElement("div");
  removeDiv.className = "remove-video";

  removeDiv.addEventListener("click", function() {
    removeUploadedFile(div, file)
  })


  // Create the img inside the remove-video div
  const removeImg = document.createElement("img");
  removeImg.src = "images/substract.png";
  removeImg.alt = "";

  // Append the remove image to the remove-video div
  removeDiv.appendChild(removeImg);
  
  // Create the document name
  const p = document.createElement("p");
  const u = document.createElement("u");
  
  // Replace 'Document Name' with the name of the uploaded file
  u.textContent = file.name;
  p.appendChild(u);

  // Create the video element for the thumbnail
  const videoThumbnail = document.createElement("video");
  videoThumbnail.src = objectURL;
  videoThumbnail.controls = true;
  videoThumbnail.style = 'width: 10rem; height: 10rem; object-fit: cover';
  videoThumbnail.classList.add('video-thumbnail');
  videoThumbnail.addEventListener('loadeddata', function () {
    this.currentTime = this.duration / 2; // Set the thumbnail to be in the middle of the video
  });

  div.appendChild(videoThumbnail);
  div.appendChild(p)
  div.appendChild(removeDiv)

  videoGrid.insertBefore(div, addNewVideoDiv);
}


// Watch for video uploads
document.getElementById('fileInput').addEventListener('change', function () {
  const file = this.files[0];
  uploadedFiles.push(file)
  // if (file && file.type.startsWith('video/')) {
  //   generateVideoGrid(file);
  // } else {
  //   // Document being uploaded, ignore
  //   useDocumentPlaceholder(file);
  // }
  displayMedia(file.path)
  this.value = ''
});

// Fetch media files from the database
async function fetchMediaFiles(topicId) {
  try {
    const response = await fetch(`http://localhost:8000/topic/${topicId}/topic-files/`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    for (const videoGuide of data.results) {
      const fileUrl = videoGuide.file;
      const fileName = fileUrl.split('/').pop(); // Extract file name from URL
      
      // Fetch the media file as a Blob
      const mediaResponse = await fetch(fileUrl);
      const mediaBlob = await mediaResponse.blob();
      
      // Create a file object from the Blob
      const file = new File([mediaBlob], fileName, { type: mediaBlob.type });

      // Now you have a File object and can check its type
      // if (file.type.startsWith('video/')) {
      //   generateVideoGrid(file);
      // } else {
      //   useDocumentPlaceholder(file, fileUrl);
      // }
      displayMedia(fileUrl)
    }
  } catch (error) {
    console.error('There has been a problem with your fetch operation:', error);
  }
}


document
.getElementById("add-training-cards-container")
.addEventListener("click", function () {
  // Programmatically trigger the hidden file input
  document.getElementById("fileInput").click();
});



function showMessage(message, type = 'success', duration = 3000) {
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


document.getElementById('previous-question-answers').addEventListener('click', () => {
  redirectToPage('previous-topic/previous-topic.html'+'?tab='+selectedDepartment)
})

document.addEventListener("DOMContentLoaded", async function() {
  const {id, department} = getUrlParams();
  const data = await fetchTopicData(id);
  if (!data) {
      console.error('ERROR OCCURRED');
      return;
  }
  httpMethod = 'PUT'  

  displayTopicData(data);
  makeLabelReadOnly();
  populateAnswers(data.answers);
  populateQuestions(data.questions);
  if (!data.isTrained) {
      addDeleteButton(id);
  } else {
    document.getElementById('save-button').remove()
  }
  // Assuming fetchMediaFiles is defined elsewhere and fetches media files based on the topic ID
  fetchMediaFiles(id);
});

function getUrlParams() {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  return {
      id: urlParams.get('id'),
      department: urlParams.get('selectedDepartment'),
  };
}

async function fetchTopicData(id) {
  let response = await fetch(`http://localhost:8000/topic/${id}`);
  if (!response.ok) {
      return null;
  }
  return await response.json();
}

function displayTopicData(data) {
  document.getElementById("label-input").value = data.label;
  // Additional data properties can be displayed as needed
}

function makeLabelReadOnly() {
  document.getElementById("label-input").setAttribute('readonly', true);
}

function populateAnswers(answers) {
  const answersContainer = document.getElementById("answers-container");
  answers.forEach(answer => {
      const answerDiv = createQuestionElement(answer["text"], "message-square");
      answersContainer.appendChild(answerDiv);
  });
}

function populateQuestions(questions) {
  const questionsContainer = document.getElementById("questions-container");
  questions.forEach(question => {
      const questionDiv = createQuestionElement(question["text"], "idea");
      questionsContainer.appendChild(questionDiv);
  });
}

function addDeleteButton(id) {
  let container = document.getElementById('label-save-container');
  let div = document.createElement('div');
  div.classList.add('center-aligned-flex', 'save-button');
  div.id = 'delete-button';
  div.style.background = 'tomato';
  div.textContent = 'Delete';
  div.addEventListener('click', () => {
      deleteTopic(id);
  });
  container.appendChild(div);
}

// Assumes createQuestionElement is defined elsewhere to create question/answer elements
// Assumes deleteTopic is defined elsewhere to handle topic deletion


document.getElementById('save-button').addEventListener('click', () => {
  saveTopic()
})