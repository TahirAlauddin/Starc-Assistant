// Runs all the function at the time of page loaded
document.addEventListener("DOMContentLoaded", async function () {
    await sleep(2500);
  
    // Run welcome screen
    showWelcomeScreen();
  });
  
  function showWelcomeScreen() {
    // Select elements
    var welcomeLogo = document.querySelector(".center-aligned-flex.welcome-logo");
    var welcomeBot = document.querySelector(".center-aligned-flex.welcome-bot");
  
    welcomeLogo.style.display = "none";
  
    // Add the CSS properties using the style property
    welcomeBot.style.bottom = "0";
    welcomeBot.style.transition = "all 1s, -webkit-transform 1s";
    welcomeBot.style.transition = "all 1s, transform 1s";
    welcomeBot.style.width = "100%";
    welcomeBot.style.height = "100%";
    welcomeBot.style.opacity = "1";
  }
  
  // Pass time in miliseconds to stop the program
  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  
  const { ipcRenderer } = require('electron');

  document.getElementById('updateIpAddress').addEventListener('click', () => {
    ipcRenderer.send('update-ip');
  });
