// Check if the user is an admin
let tornituraTab = document.getElementById("department-tornitura");
let rettificheTab = document.getElementById("department-rettifiche");
let qualitaTab = document.getElementById("department-qualita");

let csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;

var tornituraObject = document.querySelector('#department-tornitura object');
var rettificheObject = document.querySelector('#department-rettifiche object');
var qualitaObject = document.querySelector('#department-qualita object');


// There are two values for 'currentMainContainer' var,
// 1. base
// 2. chatbot
let currentMainContainer = "base";

var perfEntries = performance.getEntriesByType("navigation");

if (perfEntries[0].type === "back_forward") {
  location.reload();
}

const textToType = ["Hi, I'm Tarsia! Welcome to chat bot, How can I help you?"];
let charIndex = 0;
let lineIndex = 0;
let typingSpeed = 100;

function typeText() {
  let typingElement = document.getElementById("typingText");
  if (lineIndex < textToType.length) {
    if (charIndex <= textToType[lineIndex].length) {
      if (typingElement) {
        typingElement.innerHTML = textToType[lineIndex].substring(
          0,
          charIndex + 1
        );
        charIndex++;
        setTimeout(typeText, typingSpeed);
      }
    }
  }
}



const recommendations = [
  "May occasionally generate incorrect information.",
  "Limited Knowledge",
  "Trained to decline inapproriate requests"
];

function clearMainDiv() {
  // Select the main div by its class
  var mainDiv = document.querySelector('.main');

  // Set its innerHTML to an empty string, removing all its contents
  mainDiv.innerHTML = '';
}


function createDropdown() {
  // Create the dropdown container div
  const dropdownContainer = document.createElement("div");
  dropdownContainer.className = "dropdown-container";

  // Create the custom dropdown select element
  const customDropdown = document.createElement("select");
  customDropdown.className = "custom-dropdown";
  customDropdown.id = "custom-dropdown";

  // Append the custom dropdown to the dropdown container
  dropdownContainer.appendChild(customDropdown);

  // Return the dropdown container
  return dropdownContainer;
}

function createChatInput() {
  // Create the chat input container div
  const chatInputContainer = document.createElement("div");
  chatInputContainer.className = "chat-input";

  // Create the message input element
  const messageInput = document.createElement("input");
  messageInput.type = "text";
  messageInput.className = "message-input";
  messageInput.id = "message-input";
  messageInput.placeholder = "Message";

  // Append the message input to the chat input container
  chatInputContainer.appendChild(messageInput);

  // Create the send message button container div
  const sendMessageButtonContainer = document.createElement("div");
  sendMessageButtonContainer.id = 'send-message-button'
  sendMessageButtonContainer.className = "send-message-button-container";
  sendMessageButtonContainer.setAttribute(
    "onclick",
    "sendMessageButtonClick()"
  );

  // Create the send message button image element
  const sendMessageButton = document.createElement("img");
  sendMessageButton.className = "send-message-button";
  sendMessageButton.src = "images/Send-Message-Arrow.png";
  sendMessageButton.alt = "";

  // Append the send message button to the send message button container
  sendMessageButtonContainer.appendChild(sendMessageButton);

  // Append the send message button container to the chat input container
  chatInputContainer.appendChild(sendMessageButtonContainer);

  // Return the chat input container
  return chatInputContainer;
}

function createQueryContainer(text) {
  // Create the query container div
  const queryContainer = document.createElement("div");
  queryContainer.className = "center-aligned-flex query-container";

  // Create the image element
  const img = document.createElement("img");
  img.src = "images/welcome-loading.gif";
  img.alt = "";

  // Append the image to the query container
  queryContainer.appendChild(img);

  // Create the paragraph element
  const p = document.createElement("p");
  p.textContent = text; // Set the text content of the paragraph

  // Append the paragraph to the query container
  queryContainer.appendChild(p);

  // Return the query container
  return queryContainer;
}


// Function to scroll to the bottom
function scrollToBottom(targetElement) {
  console.log('bottom')
  targetElement.scrollTop = targetElement.scrollHeight;
}


function addQuestionHistory(query) {
  let queryContainer = createQueryContainer(query);

  let chatbotHistoryContainer = document.querySelector(".chatbot-history-container")

  // Create a ResizeObserver instance
  var resizeObserver = new ResizeObserver(function (entries) {
    for (let entry of entries) {
      scrollToBottom(entry.target);
    }
  });

  // Start observing the chatbotHistoryContainer
  resizeObserver.observe(chatbotHistoryContainer);


  chatbotHistoryContainer.appendChild(queryContainer);
}

async function addAnswerHistory(answer, files) {
  let answerContainer = createAnswerContainer();

  let chatbotHistoryContainer = document.querySelector(".chatbot-history-container")

  // Create a ResizeObserver instance
  var resizeObserver = new ResizeObserver(function (entries) {
    for (let entry of entries) {
      scrollToBottom(chatbotHistoryContainer);
    }
  });
  // Start observing the element
  resizeObserver.observe(chatbotHistoryContainer);
  resizeObserver.observe(answerContainer);


  chatbotHistoryContainer.appendChild(answerContainer);

  const pElement = document.querySelector('.answer-container:last-child p:last-of-type');

  let characterIndex = 0;
  let typeSpeed = 10;

  function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }


  async function typeAnswer() {
    // Check if characterIndex is less than the answer's length
    if (characterIndex < answer.length) {
      pElement.innerHTML = answer.substring(0, characterIndex + 1);
      characterIndex++;
      // setTimeout(typeAnswer, typeSpeed);
      await delay(typeSpeed)
      await typeAnswer();
    }
  }

  // Start the typing effect
  await typeAnswer();
  let fileString = ""

  if (files) {

    files.forEach(file => {
      fileString += `
      <br>
      <a target="_blank" href="${BASE_URL}/media/${file}">${file.split('/')[1]}
      </a>`
    });
  }

  pElement.innerHTML = pElement.innerHTML + fileString;

}

function createAnswerContainer() {
  // Create the query container div
  const answerContainer = document.createElement("div");
  answerContainer.className = "answer-container center-aligned-flex";

  // Create the image element
  const img = document.createElement("img");
  img.src = "images/message-square.png";
  img.alt = "";

  // Append the image to the answer container
  answerContainer.appendChild(img);

  // Create the paragraph element
  const p = document.createElement("p");

  // Append the paragraph to the answer container
  answerContainer.appendChild(p);

  // Return the answer container
  return answerContainer;
}

function createChatbotContainer() {
  // Create the department main container div
  const departmentMain = document.createElement("div");
  departmentMain.className =
    "department-main max-height center-aligned-flex sub-main column-flex";
  departmentMain.id = "chatbot-container";

  // Create the chatbot container div
  const chatbotContainer = document.createElement("div");
  chatbotContainer.className =
    "chatbot-container center-aligned-flex column-flex";

  // Append the chatbot container to the department main container
  departmentMain.appendChild(chatbotContainer);

  // Create the chatbot history container div
  const chatbotHistoryContainer = document.createElement("div");
  chatbotHistoryContainer.className = "chatbot-history-container";


  // Append the chatbot history container to the chatbot container
  chatbotContainer.appendChild(chatbotHistoryContainer);

  let dropdownContainer = createDropdown();
  chatbotContainer.appendChild(dropdownContainer);

  let chatInputContainer = createChatInput();
  chatbotContainer.appendChild(chatInputContainer);

  // Return the department main container
  return departmentMain;
}

function createRecommendationsContainer(recommendations) {
  // Create the recommendations container div
  const recommendationsContainer = document.createElement("div");
  recommendationsContainer.className = "recommendations-container";

  // Loop through the recommendations array
  for (const recommendation of recommendations) {
    // Create the recommendations item div
    const recommendationsItem = document.createElement("div");
    recommendationsItem.className = "recommendations-item center-aligned-flex";

    // Create the div for the recommendation text
    const div = document.createElement("div");
    div.textContent = recommendation; // Set the text content of the div

    // Append the div to the recommendations item
    recommendationsItem.appendChild(div);

    // Append the recommendations item to the recommendations container
    recommendationsContainer.appendChild(recommendationsItem);
  }

  // Return the recommendations container
  return recommendationsContainer;
}


function createChatbotImageContainer() {
  // Create the chatbot image container div
  const chatbotImageContainer = document.createElement('div');
  chatbotImageContainer.className = 'chatbot-image-container';
  chatbotImageContainer.id = 'chatbot-image-container';


  // Create the video element
  var video = document.createElement('video');
  video.id = 'animation-vid';
  video.classList.add("animation-vid")
  video.autoplay = true;
  video.muted = true;
  video.loop = true;
  video.setAttribute('disablePictureInPicture', '');

  // Create the image element
  var img = document.createElement('img');

  img.src = '../images/robot.png';
  img.style.position = 'absolute';
  img.style.top = '50%';
  img.style.left = '50%';
  img.style.width = '25%';
  img.style.transform = 'translate(-50%, -50%)';
  img.alt = '';

  // Append the image to the chatbot image container
  chatbotImageContainer.appendChild(video);
  chatbotImageContainer.appendChild(img);

  // Create the chat message div
  const chatMessage = document.createElement('div');
  chatMessage.className = 'chat-message';
  chatMessage.id = 'chat-message';

  // Create the paragraph element for typing text
  const p = document.createElement('p');
  p.id = 'typingText';

  // Append the paragraph to the chat message div
  chatMessage.appendChild(p);



  // Append the chat message div to the chatbot image container
  chatbotImageContainer.appendChild(chatMessage);

  // Return the chatbot image container
  return chatbotImageContainer;
}


function createChatbotMain() {
  let mainContainer = document.querySelector(".main");

  // Create the 'department-main' container div
  const departmentMain = document.createElement('div');
  departmentMain.className = 'department-main max-height center-aligned-flex sub-main column-flex';
  departmentMain.id = 'department-main';

  let chatbotContainer = createChatbotContainer();

  departmentMain.appendChild(chatbotContainer);
  mainContainer.appendChild(departmentMain);
}



async function createDepartmentMain() {

  let mainContainer = document.querySelector(".main");

  // Create the 'department-main' container div
  const departmentMain = document.createElement('div');
  departmentMain.className = 'department-main max-height center-aligned-flex sub-main column-flex';
  departmentMain.id = 'department-main';

  // Create the 'departments-title' heading
  const departmentsTitle = document.createElement('h2');
  departmentsTitle.className = 'departments-title';
  departmentsTitle.id = 'departments-title';

  // Append the title to the 'department-main' container
  departmentMain.appendChild(departmentsTitle);

  let chatbotImageContainer = createChatbotImageContainer()
  departmentMain.appendChild(chatbotImageContainer);

  let dropdownContainer = createDropdown()
  departmentMain.appendChild(dropdownContainer);

  let chatInputContainer = createChatInput();
  departmentMain.appendChild(chatInputContainer);

  let recommendationsContainer = createRecommendationsContainer(recommendations);
  departmentMain.appendChild(recommendationsContainer);


  mainContainer.appendChild(departmentMain);
  await sleep(100);
  typeText();
  responsivePage();
}


async function sendMessageButtonClick() {
  let data = await sendQuery();
  let answer = data.response;
  let files = data.files;

  let query = document.getElementById("message-input").value.trim();
  document.getElementById("message-input").value = '';

  if (currentMainContainer != 'chatbot') {
    let selectedClass = "selected-department-box";
    charIndex = 0;
    clearMainDiv()
    createChatbotMain();
    currentMainContainer = 'chatbot'
    if (qualitaTab.classList.contains(selectedClass)) {
      addOptionsToDropdown("Qualita");
    } else if (tornituraTab.classList.contains(selectedClass)) {
      addOptionsToDropdown("Tornitura");
    } else if (rettificheTab.classList.contains(selectedClass)) {
      addOptionsToDropdown("Rettifiche");
    }
  }
  addQuestionHistory(query);
  // answer = "This is answer";
  await sleep(1000);
  addAnswerHistory(answer, files);

  document.getElementById('message-input').click()
}

// Pass time in miliseconds to stop the program
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}


function responsivePage() {
  var chatMessage = document.getElementById('chatbot-image-container');

  var parentWidth = chatMessage.offsetWidth; // Get the width of the parent element
  var parentHeight = chatMessage.offsetHeight; // Get the height of the parent element

  var relativeFontSize = Math.min(parentWidth / 8, parentHeight / 8); // Adjust the division factor (10) to achieve the desired font size

  var style = document.createElement('style');

  // Append the style element to the head of the document
  document.head.appendChild(style);

  style.sheet.insertRule('#chat-message { font-size: ' + String((relativeFontSize * 37) / 100) + 'px; height: ' + String((relativeFontSize * 72) / 40) + 'px; width: ' + String((relativeFontSize * 72) / 18) + 'px; }', 0);

}

window.addEventListener('resize', responsivePage);
responsivePage()


async function sendQuery() {
  let query = document.getElementById("message-input").value.trim();
  try {
    const response = await fetch(`${BASE_URL}/chatbot_model/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrfToken
      },
      body: JSON.stringify({ "query": query })
    });

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const data = await response.json();
    return data;  // Returning the data here

  } catch (error) {
    console.error(error);
  }
}



// Execute a function when the user presses a key on the keyboard
document.addEventListener("keypress", function (event) {
  // If the user presses the "Enter" key on the keyboard
  if (event.key === "Enter") {
    // Cancel the default action, if needed
    event.preventDefault();
    // Trigger the button element with a click
    document.getElementById("send-message-button").click();
  }
});


window.onload = function () {
  document.getElementById('message-input').focus()
}