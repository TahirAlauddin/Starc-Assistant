let topicId = 1;
let uploadedFiles = []
let httpMethod = 'POST'
let isTrained = false

const fileStates = {
  newFiles: [], // Array of File objects to be uploaded
  existingFiles: [], // Array of objects representing files from the server
  filesMarkedForDeletion: [] // Array of IDs for files to be deleted
}


async function updateTopicFiles(trainingId, addedFiles, removedFiles) {
  const formData = new FormData();
  formData.append('topicId', trainingId);

  // Append added files
  addedFiles.forEach(file => {
    formData.append('addedFiles', file);
  });

  // Append removed file IDs
  removedFiles.forEach(fileId => {
    formData.append('removedFiles', fileId);
  });

  const response = await fetch(`${BASE_URL}/topic/${trainingId}/topic-files-bulk/`, {
    method: 'POST',
    body: formData
  });

  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }
}


function removeUploadedFile(div, file) {
  div.remove()
  // Assuming uploadedFiles is your list and div is the element to be removed
  uploadedFiles = uploadedFiles.filter(item => item !== file)
}

var perfEntries = performance.getEntriesByType('navigation')

if (perfEntries[0].type === 'back_forward') {
  location.reload()
}

let uploadedVideos = []

// Get references to the containers, buttons, and input fields
const questionsContainer = document.getElementById('questions-container')
const answersContainer = document.getElementById('answers-container')
const questionInput = document.getElementById('question-input')
const answerInput = document.getElementById('answer-input')

answerInput.addEventListener('keyup', function (event) {
  if (event.key === 'Enter') {
    addAnswer()
  }
})

questionInput.addEventListener('keyup', function (event) {
  if (event.key === 'Enter') {
    addQuestion()
  }
})

function addDeleteButtonInTopic(id) {
  let container = document.getElementById('label-save-container')
  let div = document.createElement('div')
  div.classList.add('center-aligned-flex', 'save-button')
  div.id = 'delete-button'
  div.style.background = 'tomato'
  div.textContent = 'Delete'
  div.addEventListener('click', () => {
    deleteTopic(id)
  })
  container.appendChild(div)
}

function createQuestionElement(text, img) {
  // Create a new div element with the specified structure
  const questionDiv = document.createElement('div')
  questionDiv.className = 'center-aligned-flex question'

  // Create and append the image element
  const imgElement = document.createElement('img')
  imgElement.src = 'images/' + img + '.png'
  imgElement.alt = ''
  questionDiv.appendChild(imgElement)

  // Create and append the "break" div
  const breakDiv1 = document.createElement('div')
  breakDiv1.className = 'break'
  breakDiv1.textContent = '|'
  questionDiv.appendChild(breakDiv1)

  // Create and append the question text div
  const questionTextDiv = document.createElement('div')
  if (img === 'idea') {
    questionTextDiv.className = 'question-text'
  } else {
    questionTextDiv.className = 'answer-text'
  }
  questionTextDiv.classList.add('center-aligned-flex')
  questionTextDiv.textContent = text
  questionDiv.appendChild(questionTextDiv)

  // Create and append the second "break" div
  const breakDiv2 = document.createElement('div')
  breakDiv2.className = 'break'
  breakDiv2.textContent = '|'
  questionDiv.appendChild(breakDiv2)

  // Create and append the "remove-answer" div with an image
  const removeAnswerDiv = document.createElement('div')
  removeAnswerDiv.className = 'remove-answer'

  const removeImgElement = document.createElement('img')
  removeImgElement.src = 'images/substract.png'
  removeImgElement.alt = ''
  removeAnswerDiv.appendChild(removeImgElement)

  // Add the event listener to remove the question or answer
  removeAnswerDiv.addEventListener('click', function () {
    questionDiv.remove()
  })

  questionDiv.appendChild(removeAnswerDiv)

  return questionDiv
}

function cleanInputFields() {
  location.reload()
}

// Function to add a new question
function addQuestion() {
  const questionText = questionInput.value.trim()
  if (questionText !== '') {
    const questionDiv = createQuestionElement(questionText, 'idea')
    questionsContainer.appendChild(questionDiv)

    // Clear the input field and hide it
    questionInput.value = ''
  }
}

// Function to add a new answer
function addAnswer() {
  const answerText = answerInput.value.trim()
  if (answerText !== '') {
    const answerDiv = createQuestionElement(answerText, 'message-square')
    answersContainer.appendChild(answerDiv)

    // Clear the input field and hide it
    answerInput.value = ''
  }
}

async function saveFile(file, topicId) {
  if (!file || !topicId) {
    console.error('File or topic ID is missing.')
    return false // Indicates failure
  }

  const formData = new FormData()
  formData.append('file', file)
  formData.append('topic', topicId)

  try {
    const response = await fetch(`${BASE_URL}/topic/${topicId}/topic-files/`, {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      const errorText = (await response.text()) || 'Server response not OK'
      console.error('Error uploading VideoGuide:', errorText)
      showMessage(errorText, 'error')
      return false // Indicates failure
    }

    const data = await response.json()
    console.log('VideoGuide uploaded successfully!', data)
    return true // Indicates success
  } catch (error) {
    console.error('Error uploading VideoGuide:', error)
    showMessage(error.toString(), 'error')
    return false // Indicates failure
  }
}

function deleteTopic(topicId) {
  showMessage('Deleting Topic', 'information')

  fetch(`${BASE_URL}/topic/${topicId}`, {
    method: 'DELETE'
  })
    .then(response => {
      if (!response.ok) {
        console.log('Error deleting topic:', response.statusText)
        showMessage('Error deleting topic:' + response.statusText, 'error')
        throw new Error('Network response was not ok.')
      }
      console.log(response)
      if (response.status == 204) {
        console.log('Topic deleted successfully!')
        showMessage('Topic deleted successfully!', 'success')
      } else {
        showMessage('Failed to delete topic!', 'error')
      }
      setTimeout(() => {
        redirectToPage(
          'previous-topic/previous-topic.html' + '?tab=' + selectedDepartment
        )
      }, 500)
    })
    .catch(error => {
      console.error('Failed to delete topic:', error)
    })
}

async function saveTopic() {
  if (isTrained) {
    showMessage(
      'Cannot save the topic that is used to train the model',
      'error'
    )
    return
  }
  showMessage('Saving Topic', 'information')

  const questions = document.querySelectorAll('.question-text')
  const answers = document.querySelectorAll('.answer-text')
  const label = document.getElementById('label-input')
  let selectedMachine = null
  const selectElement = document.getElementById('custom-dropdown')
  selectedMachine = selectElement.value

  let answers_data = []
  let questions_data = []
  let files = []

  answers.forEach(answer => {
    answers_data.push(answer.textContent)
  })
  questions.forEach(question => {
    questions_data.push(question.textContent)
  })

  const data = {}
  if (questions_data.length < 5) {
    showMessage('Questions should be 5 or more', 'error')
    return
  }

  if (answers_data.length < 1) {
    showMessage('Add atleast 1 answer', 'error')
    return
  }

  if (label === '') {
    showMessage('Add a label', 'error')
    return
  }

  data['label'] = label.value.trim()
  data['machine'] = selectedMachine
  data['questions'] = questions_data
  data['answers'] = answers_data

  console.log(data)

  if (!(data.label && data.machine && data.questions && data.answers)) {
    console.log('Add label/question/answer:', 'Unknown error')
    showMessage('Add label/question/answer', 'error')
    return
  }

  console.log("Update PUT")
  if (httpMethod == 'PUT') {
    await updateTopicFiles(topicId, fileStates.newFiles, fileStates.filesMarkedForDeletion);
  }

  await fetch(`${BASE_URL}/upload-data/`, {
    method: httpMethod,
    body: JSON.stringify(data)
  })
    .then(response => {
      // Check if the response is ok (status in the range 200-299)
      if (!response.ok) {
        // Throw an error for any response not in the 200 range, including 200 status code check
        console.log(response)
        console.log('Error uploading data:', data.message || 'Unknown error')
        showMessage(
          'Error saving data:' + data.message || 'Unknown error',
          'error'
        )
        throw new Error('Network response was not ok: ' + response.statusText)
      }

      return response.json() // We can safely parse JSON now
    })
    .then(async data => {
      // Assuming 'data' contains a property 'status_code' to check for successful operation
      console.log('Topic saved successfully!')
      showMessage('Topic saved successfully!', 'success')

      // Save files through this method only if creating new topic
      if (httpMethod !== 'PUT') {
        if (uploadedFiles && data.topic && data.topic.id) {
          const results = await Promise.all(
            uploadedFiles.map(file => saveFile(file, data.topic.id))
          )
          console.log(results)
          // Check if all uploads were successful
          const allUploadsSuccessful = results.every(result => result === true)
          if (allUploadsSuccessful) {
            // All uploads successful, reinitialize uploadedVideos
            uploadedVideos = []
          }
          return allUploadsSuccessful
        } else {
          // No files to upload, treat as successful
          uploadedVideos = []
          return true
        }
      }

    })
    .then(allUploadsSuccessful => {
      // Now you have a flag indicating the success of all uploads
      if (allUploadsSuccessful) {
        // All uploads were successful
        console.log('All files have been successfully uploaded')
      } else {
        // At least one upload failed
        console.log('Some files might not have been uploaded successfully')
      }
      // cleanInputFields(); // You can call this if you still want to clean the fields regardless of success
    })
    .catch(error => {
      console.error('Error in the file upload process:', error)
      showMessage('Error in saving topic or uploading files!', 'error')
      // TODO: update the error message
    })
}

// Watch for video uploads
document.getElementById('fileInput').addEventListener('change', function () {
  const file = this.files[0]
  uploadedFiles.push(file)
  displayMedia(file.path, file)
  // update fileStates 
  fileStates.newFiles.push(file)
  this.value = ''
  console.log(uploadedFiles, uploadedVideos)
})

// Fetch media files from the database
async function fetchMediaFiles(topicId) {
  try {
    const response = await fetch(`${BASE_URL}/topic/${topicId}/topic-files/`)
    if (!response.ok) {
      throw new Error('Network response was not ok')
    }
    const data = await response.json()
    for (const topicFile of data.results) {
      // Create a file object from the Blob
      displayMedia(topicFile.file, topicFile.id)
      // Check if file already exists in fileStates. If not, mark as unchanged
      fileStates.existingFiles.push(topicFile.id)
    }
  } catch (error) {
    console.error('There has been a problem with your fetch operation:', error)
  }
}

document
  .getElementById('add-training-cards-container')
  .addEventListener('click', function () {
    // Programmatically trigger the hidden file input
    document.getElementById('fileInput').click()
  })

document
  .getElementById('previous-question-answers')
  .addEventListener('click', () => {
    redirectToPage(
      'previous-topic/previous-topic.html' + '?tab=' + selectedDepartment
    )
  })

document.addEventListener('DOMContentLoaded', async function () {

  let selectedClass = "selected-department-box";

  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);

  let tab = urlParams.get("tab");
  console.log(tab)

  if (tab == "tornitura") {
    await setTornituraTab(selectedClass);

  }
  else if (tab == "rettifiche") {
    await setRettificheTab(selectedClass);
  }

  else if (tab == "qualita") {
    await setQualitaTab(selectedClass);
  }
  else {
    await setTornituraTab(selectedClass)
  }

  const { id, department } = getUrlParams()

  topicId = id;

  const data = await fetchTopicData(id)
  if (!data) {
    console.error('ERROR OCCURRED')
    return
  }

  makeLabelReadOnly()

  populateData(data)

  // Make sure Topics are deletable because we have "Train New model function" now
  addDeleteButtonInTopic(id)

  // Assuming fetchMediaFiles is defined elsewhere and fetches media files based on the topic ID
  fetchMediaFiles(id)
})

function populateData(data) {
  // Reset file state
  fileStates.newFiles = [];
  fileStates.filesMarkedForDeletion = [];
  fileStates.existingFiles = [];

  httpMethod = 'PUT'

  displayTopicData(data)

  populateAnswers(data.answers)
  populateQuestions(data.questions)
  populateMachine(data.machine)
}

function getUrlParams() {
  const queryString = window.location.search
  const urlParams = new URLSearchParams(queryString)
  return {
    id: urlParams.get('id'),
    department: urlParams.get('selectedDepartment')
  }
}

async function fetchTopicData(id) {
  let response = await fetch(`${BASE_URL}/topic/${id}`)
  if (!response.ok) {
    return null
  }
  return await response.json()
}

function displayTopicData(data) {
  document.getElementById('label-input').value = data.label
  // Additional data properties can be displayed as needed
}

function makeLabelReadOnly() {
  document.getElementById('label-input').setAttribute('readonly', true)
}

async function populateMachine(machineID) {
  try {
    const response = await fetch(`${BASE_URL}/machines/${machineID}`)
    const data = await response.json()

    if (data) {
      const dropdown = document.getElementById('custom-dropdown')
      dropdown.value = data.name
    } else {
      console.error('Machine not found')
    }
  } catch (error) {
    console.error('Error fetching machine:', error)
  }
}

function populateAnswers(answers) {
  const answersContainer = document.getElementById('answers-container')
  answers.forEach(answer => {
    const answerDiv = createQuestionElement(answer['text'], 'message-square')
    answersContainer.appendChild(answerDiv)
  })
}

function populateQuestions(questions) {
  const questionsContainer = document.getElementById('questions-container')
  questions.forEach(question => {
    const questionDiv = createQuestionElement(question['text'], 'idea')
    questionsContainer.appendChild(questionDiv)
  })
}

function addDeleteButton(id) {
  let container = document.getElementById('label-save-container')
  let div = document.createElement('div')
  div.classList.add('center-aligned-flex', 'save-button')
  div.id = 'delete-button'
  div.style.background = 'tomato'
  div.textContent = 'Delete'
  div.addEventListener('click', () => {
    deleteTopic(id)
  })
  container.appendChild(div)
}

document.getElementById('save-button').addEventListener('click', () => {
  saveTopic()
})
