
function populateData(id) {

  // Reset file state
  fileStates.newFiles = [];
  fileStates.filesMarkedForDeletion = [];
  fileStates.existingFiles = [];
  let department = "";

  fetch(`${BASE_URL}/training/` + id)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })

    .then(data => {

      document.getElementById('title').textContent = data.title;
      document.getElementById('content').textContent = data.content;

      // ! This is hard coded, might change in future
      if (data.category === 1) {
        department = "Tornitura";
      }
      else if (data.category === 2) {
        department = "Rettifiche";
      }
      else if (data.category === 3) {
        department = "Qualita";
      }

      document.getElementById('custom-dropdown').value = department;

      data.files.forEach(fileUrl => {
        fetch(fileUrl)
          .then(response => response.json())
          .then(fileData => {
            // Display each media file using the 'file' attribute in the response           
            displayMedia(fileData.file, fileData.id);
            // Check if file already exists in fileStates. If not, mark as unchanged
            fileStates.existingFiles.push(fileData.id);

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

// Function to apply paste event listeners
function applyPasteEventListeners() {
  // document.querySelectorAll('div[contenteditable="true"]').forEach(div => {
  document.getElementById('title').addEventListener('paste', function (e) {
    e.preventDefault();
    const text = (e.clipboardData || window.clipboardData).getData('text');
    document.execCommand('insertHTML', false, text);
  });
}

document.addEventListener("DOMContentLoaded", function () {

  applyPasteEventListeners()

  let user = sessionStorage.getItem('isAdmin')
  // Grab the .edit-para div and .training-vids-para
  const editPara = document.getElementById("edit-para");
  const paraDiv = document.querySelector(".training-vids-para");
  const titleDiv = document.querySelector(".training-vids-title");

  let buttonContainer = document.getElementById("save-training-button-container")

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
    // If user is logged in as admin, don't show login page.
    document.getElementById('admin-panel-button').style.display = 'none';

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
    document.getElementById('machine-button').style.display = 'none'

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
      fileStates.newFiles.push(file)
    });
    this.value = ''
  });

  // Check whether showing an existing Training object or trying to create a new one
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const id = urlParams.get('id');


  // Decision making (update or create)
  if (id) {
    populateData(id);
    if (user) {
      document.getElementById('save-training-button').addEventListener('click', () => {
        updateTraining(id);
      })
      addDeleteButton(id)
    } else {
      let elements = document.querySelectorAll('div[contentEditable="true"]')
      elements.forEach(element => {
        element.contentEditable = 'false'
      })
    }
  } else if (user) {
    document.getElementById('save-training-button').addEventListener('click', saveTraining);
  }
});


document.addEventListener("DOMContentLoaded", function () {
  let trainingTab = document.getElementById("training-button");
  let trainingObject = document.querySelector('#training-button object');
  const sidebar = document.querySelector('.sidebar');
  const arrow = document.createElement('div');

  trainingTab.classList.add("selected-department-box")
  trainingObject.setAttribute('data', '../../images/Training-Selected.svg');

  arrow.classList.add('arrow');
  arrow.innerHTML = '>';

  document.body.appendChild(arrow);

  window.addEventListener('resize', function () {
    resetSidebar();
  });

  // Toggle sidebar visibility on arrow click
  arrow.addEventListener('click', function () {
    sidebar.style.width = sidebar.style.width === '0px' ? '130px' : '0px';
    arrow.style.left = arrow.style.left === '0px' ? '130px' : '0px';
    arrow.textContent = arrow.textContent === '>' ? '<' : '>';
  });
  resetSidebar();

});

