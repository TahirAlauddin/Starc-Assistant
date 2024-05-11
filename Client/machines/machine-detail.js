// Function to retrieve URL parameters
function getParameterByName(name, url) {
  if (!url) url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
      results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}
$(document).ready(function() {
  var action = getParameterByName('machine');

  // Hide or show buttons based on the action
  if (action == null) {
    console.log("add", action);
      $('#add-btn').show();
      $('#edit-btn').hide();
      $('#del-btn').hide();
      fetchDepartments();
  } else {
    console.log("edit", action);
      $('#add-btn').hide();
      $('#edit-btn').show();
      $('#del-btn').show();
      fetchDepartments();
  }
});


var machineName = getParameterByName('machine');
var departmentName = getParameterByName('department');
var id = getParameterByName('id');
const button = document.querySelector('.del-btn'); 

button.setAttribute('data-machine-id', id);
const editButton = document.querySelector('.edit-btn'); 

editButton.setAttribute('data-machine-id', id);


document.getElementById('machine-name').value = machineName;
document.getElementById('heading-name').innerText = machineName.toUpperCase();

var departmentSelect = document.getElementById('department');
var departmentOption = document.createElement('option');
departmentOption.text = departmentName;
departmentSelect.add(departmentOption);
departmentSelect.value = departmentName;
async function fetchDepartments() {
  try {
      const response = await fetch(`${BASE_URL}/departments/`);
      const data = await response.json();

      const selectElement = document.getElementById('department');
      data.forEach(department => {
          const optionElement = document.createElement('option');
          optionElement.value = department.id;
          optionElement.textContent = department.name;
          selectElement.appendChild(optionElement);
      });
  } catch (error) {
      console.error('Error fetching departments:', error);
  }
}



function del() {
var button = document.getElementById('del-btn'); 
var machineId = button.getAttribute('data-machine-id');

fetch(`${BASE_URL}/machines/${machineId}/delete/`, {
  method: 'POST',
  headers: {
      'Content-Type': 'application/json',
      // Add any additional headers if needed
  },
  // Add any request body if needed
})
.then(response => {
  if (response.ok) {
      console.log('Machine deleted successfully');
      window.location.href = 'machine.html';
  } else {
      throw new Error('Failed to delete machine');
  }
})
.catch(error => {
  console.error('Failed to delete machine:', error);
});


};
// Edit button click event listener
function edit() {
var button = document.getElementById('edit-btn'); 
var machineId = button.getAttribute('data-machine-id');
var newName = document.getElementById('machine-name').value;
var newDepartment = document.getElementById('department').value;

$.ajax({
  url: `${BASE_URL}/machines/` + machineId + `/edit/`,  
  method: 'POST',  
  data: {  
            new_name: newName,
            new_department: newDepartment
  },
  success: function(response) {
      console.log('Machine edited successfully');
      
      window.location.href = 'machine.html';  
  },
  error: function(error) {
      console.error('Failed to edit machine:', error);
  }
}); 
};

// Edit button click event listener
function add() {
  var button = document.getElementById('add-btn'); 
  var newName = document.getElementById('machine-name').value;
  var newDepartment = document.getElementById('department').value;
  
  $.ajax({
    url: `${BASE_URL}/machines/add/`, 
    method: 'POST',  
    data: {  
              new_name: newName,
              new_department: newDepartment
    },
    success: function(response) {
        console.log('Machine added successfully');
        
        window.location.href = 'machine.html';  
    },
    error: function(error) {
        console.error('Failed to add machine:', error);
    }
  });
};