
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
  