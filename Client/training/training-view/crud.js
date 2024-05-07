async function getDepartmentIdByName(departmentName) {
  try {
      const response = await fetch('http://localhost:8000/departments/');
      const departments = await response.json();

      // Find the department whose name matches the given departmentName
      const department = departments.find(dep => dep.name === departmentName);

      // Return the department ID or null if not found
      return department ? department.id : null;
  } catch (error) {
      console.error('Failed to fetch departments:', error);
      return null;
  }
}


async function saveTraining() {
    let title = document.getElementById('title').textContent;
    let content = document.getElementById('content').textContent;
    let department = document.getElementById('custom-dropdown').value;

    let departmentID = await getDepartmentIdByName(department);

    console.log(departmentID)
  
    let trainingResponse = await fetch(`${BASE_URL}/training/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: title,
        content: content,
        category: departmentID
      })
    });
  
    if (!trainingResponse.ok) {
      showMessage('Bad Request, couldn\'t save the data', 'error')
      throw new Error(`HTTP error! Status: ${trainingResponse.status}`);
    }
    
    const training = await trainingResponse.json();
    const newPageURL = `training-view.html?id=${training.id}`;
    redirectToPage(newPageURL);
    showMessage('Successfully Added Training', 'success')
    await saveTrainingFiles(training.id)
    return training.id;
  }
  
async function saveTrainingFiles(trainingId) {
  let fileUploadPromises = uploadedFiles.map(async file => {
    let formData = new FormData();
    formData.append('file', file);
    formData.append('training', trainingId);

    return await fetch(`${BASE_URL}/training/${trainingId}/training-files/`, {
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
    
async function deleteTraining(id) {
  try {
    const response = await fetch(`${BASE_URL}/training/${id}/`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    console.log("Training deleted successfully.");
    showMessage("Training deleted successfully.", 'success')
    setTimeout(() => {
      location.href = '../training.html'
    }, 500);
  } catch (error) {
    console.error("Failed to delete training:", error);
    showMessage(`${error}`, 'error')
  }  
}

  
async function updateTraining(trainingId) {
    // , updatedTitle, updatedContent, addedFiles, removedFiles) {
  let updatedContent = document.getElementById('content').textContent;
  let updatedTitle = document.getElementById('title').textContent;
  let department = document.getElementById('custom-dropdown').value;

  let departmentID = await getDepartmentIdByName(department);
  
  try {
    await updateTrainingData(trainingId, updatedTitle, updatedContent, departmentID);
    await updateTrainingFiles(trainingId, fileState.addedFiles, fileState.removedFiles);
    console.log("Training updated successfully.");
  } catch (error) {
    console.error("An error occurred during the update:", error);
  }
}

async function updateTrainingData(trainingId, updatedTitle, updatedContent, departmentID) {
  const updateResponse = await fetch(`${BASE_URL}/training/${trainingId}/`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: updatedTitle,
      content: updatedContent,
      category: departmentID
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
    
      const response = await fetch(`${BASE_URL}/training/${trainingId}/training-files-bulk/`, {
        method: 'POST',
        body: formData
      });
    
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
    }
    