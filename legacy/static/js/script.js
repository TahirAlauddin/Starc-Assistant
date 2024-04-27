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


document.getElementById("next-button").addEventListener("click", function() {
    var department = document.getElementById("department");
    if (department.value == "Select Option") {
        createMessage("You have not selected any department!", true)
    } else {
        window.location.href = "chatbot?department=" + encodeURIComponent(department.value);
    }
})

function chatBotPage(department) {
    window.location.href = "chatbot?department=" + encodeURIComponent(department);
}

