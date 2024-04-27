function createMachineSelector(containerId) {
    // Get the container div by its id
    var container = document.getElementById(containerId);

    console.log(container)
    // Create the label element
    var label = document.createElement("label");
    label.setAttribute("for", "machine");
    label.setAttribute("id", "machine_label");
    label.textContent = "Choose a machine:";

    // Create the select element
    var select = document.createElement("select");
    select.setAttribute("name", "machine");
    select.setAttribute("id", "machine");

    // Append the label and select elements to the container div
    container.appendChild(label);
    container.appendChild(select);
}

function createMessage(message, isError) {
    const messageContainer = document.getElementById('message-container');
  
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message');

    if (isError) {
        messageDiv.classList.add('red-message');
    }
  
    const closeBtn = document.createElement('span');
    closeBtn.classList.add('close-btn');
    closeBtn.innerHTML = '&times;';
    closeBtn.addEventListener('click', function() {
      messageDiv.remove();
    });
  
    messageDiv.appendChild(closeBtn);
    messageDiv.appendChild(document.createTextNode(message));
  
    messageContainer.appendChild(messageDiv);
}


document.addEventListener("DOMContentLoaded", function () {
    var urlParams = new URLSearchParams(window.location.search);
    var department = urlParams.get('department');
    
    if (department) {
        var machines = {
            "TORNITURA": ["PUMA SMX", "DOOSAN TT", "DMG MORI", "OKUMA", "MORI SEIKI", "GRAZIANO"],
            "RETTIFICA": ["PROFLEX 2", "PROFLEX 3", "LIZZINI", "KOPP", "SAGITECH"],
            "PARCO ROBOT": ["ROBOJOB", "COMAU GT", "COMAU RADDRIZZATURA", "ABB", "FANUC GT", "FANUC GPT"],
            "QUALITÀ": ["ADCOLE", "ALTIMETRO", "TAYLOR HOBSON", "WENZEL 3D", "PROIETTORE"]
        };
        
        var machineDropdown = document.getElementById("machine");
        createMachineSelector("machine_selector");
        machineDropdown = document.getElementById("machine")
        machines[department].forEach(function(machine) {
            var option = document.createElement("option");
            option.text = machine;
            option.value = machine;
            machineDropdown.add(option);
        });
    }
});



function sendMessageQuery () {
    let message = document.getElementById('message-input').value.trim();
    fetch(`/chatbot_model/${encodeURIComponent(message)}`)
    .then(response => {
        if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        // Handle the response data
        console.log(data);
        const x = data['message']; // Assuming `x` is the value from the response JSON
    
        // Create a new <div> element
        const div = document.createElement('div');
    
        // Set the value of `x` as the text content of the <div>
        div.textContent = x;
    
        // Append the <div> to the document body (or any desired parent element)
        document.body.appendChild(div);
          

    })
    .catch(error => {
        // Handle any errors
        console.error(error);
    });
}