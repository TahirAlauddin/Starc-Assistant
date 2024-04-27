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

var machineName = getParameterByName('machine');
var departmentName = getParameterByName('department');

document.getElementById('machine-name').value = machineName;
document.getElementById('heading-name').innerText = machineName.toUpperCase();
if (machineName !== null && departmentName !== null) {

  var departmentSelect = document.getElementById('department');
  var departmentOption = document.createElement('option');
  departmentOption.text = departmentName;
  departmentSelect.add(departmentOption);
  departmentSelect.value = departmentName;
}