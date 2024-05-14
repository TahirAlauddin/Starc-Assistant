const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const { ipcRenderer } = require('electron');

let tab = urlParams.get("tab");

var selectedDepartment = tab;

function redirectToPage(page) {
    // Define the URL of the target page
    let targetPageURL = page;


    let isAdmin = sessionStorage.getItem("isAdmin");

    if (page == 'login.html' && isAdmin == 'true') {
        targetPageURL = 'admin-panel.html'
    }

    window.location.href = targetPageURL;
}


async function retrainModel() {
    fetch(`${BASE_URL}/retrain-model`)
        .then(async response => {
            if (!response.ok) {
                // If the HTTP status code is 409 or any other non-2xx, throw an error
                let res = await response.json()
                if (response.status == 409) {
                    throw new Error(res.message);
                }
                throw new Error(`HTTP error, status = ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            ipcRenderer.send('start-training');
            showMessage(data.message);
        })
        .catch(error => {
            console.error('Error retraining model:', error);
            showMessage(error.message, 'error');
        });
}


document.getElementById("retrain-model-button").addEventListener("click", retrainModel)

function populatePreviousTopics() {
    document.getElementById('topic-container').innerHTML = "";

    fetch(`${BASE_URL}/topic/?machine__department=${selectedDepartment}`)
        .then(response => response.json())
        .then(data => {
            data.results.forEach(topic => {
                addTopicItem(topic.id, topic.label);
            });
        })
        .catch(error => console.error('Error fetching topics:', error));
}

function addTopicItem(id, tag) {
    const element = document.createElement('div');
    element.className = 'center-aligned-flex previous-questions';
    element.addEventListener('click', () => redirectToPage(`../admin-panel.html?id=${id}&tab=${selectedDepartment}`));
    const questionAnswerImage = document.createElement('img');
    questionAnswerImage.className = 'question-answer-image';
    questionAnswerImage.src = 'images/question-and-answer.png';
    questionAnswerImage.alt = '';

    const breakDiv = document.createElement('div');
    breakDiv.className = 'break';
    breakDiv.textContent = '|';

    const questionAnswerText = document.createElement('div');
    questionAnswerText.className = 'question-answer-text';
    questionAnswerText.textContent = tag;

    const nextButton = document.createElement('img');
    nextButton.className = 'next-button';
    nextButton.src = 'images/check-previous-question.png';

    element.appendChild(questionAnswerImage);
    element.appendChild(breakDiv);
    element.appendChild(questionAnswerText);
    element.appendChild(nextButton);

    document.getElementById('topic-container').appendChild(element);
}


window.onload = populatePreviousTopics



// Function to create a dictionary with page data and setup pagination
async function setupPagination() {


    let response = await fetch(`${BASE_URL}/topic/?machine__department=${selectedDepartment}`)
    let data = await response.json()


    // Assuming data is an array of items, and you decide how many items per page
    const itemsPerPage = 10; // Adjust based on your needs
    const totalPages = Math.ceil(data.count / itemsPerPage);

    document.getElementById('topic-container').innerHTML = ''; // Clear existing pagination links
    data.results.forEach(topic => {
        addTopicItem(topic.id, topic.label);
    })


    // Function to generate pagination and attach event listeners
    async function generatePagination(currentPage, totalPages) {
        const container = document.getElementById('pagination-container');
        container.innerHTML = ''; // Clear existing pagination links

        // Add 'Previous' button
        if (totalPages > 1) {
            const prevPage = currentPage > 1 ? currentPage - 1 : 1;
            const prevButton = document.createElement('a');
            prevButton.href = '#';
            prevButton.textContent = 'Previous';
            prevButton.addEventListener('click', async function (e) {
                e.preventDefault();
                document.getElementById('topic-container').innerHTML = ''; // Clear topics container

                // Fetch topics for clicked page
                let response = await fetch(`${BASE_URL}/topic/?machine__department=${selectedDepartment}&page=${prevPage}`);
                let topics = await response.json();
                topics.results.forEach(topic => {
                    addTopicItem(topic.id, topic.label);
                });

                // Load the previous page
                generatePagination(prevPage, totalPages);
            });
            container.appendChild(prevButton);
        }

        // Determine range of page numbers to display
        let startPage = Math.max(currentPage - 2, 1);
        let endPage = Math.min(startPage + 4, totalPages);

        // Adjust startPage if we're at the last few pages
        if (currentPage > totalPages - 5) {
            startPage = Math.max(totalPages - 4, 1);
            endPage = totalPages;
        }

        // Generate page links within range

        for (let pageNumber = startPage; pageNumber <= endPage; pageNumber++) {
            const pageLink = document.createElement('a');
            pageLink.href = '#';
            pageLink.textContent = pageNumber;
            pageLink.className = pageNumber === currentPage ? 'active' : '';
            pageLink.addEventListener('click', async function (e) {
                e.preventDefault();
                document.getElementById('topic-container').innerHTML = ''; // Clear topics container

                // Fetch topics for clicked page
                let response = await fetch(`${BASE_URL}/topic/?machine__department=${selectedDepartment}&page=${pageNumber}`);
                let topics = await response.json();
                topics.results.forEach(topic => {
                    addTopicItem(topic.id, topic.label);
                });
                generatePagination(pageNumber, totalPages); // Regenerate pagination
            });
            container.appendChild(pageLink);
        }

        if (totalPages > 1) {
            // Add 'Next' button
            const nextPage = currentPage < totalPages ? currentPage + 1 : totalPages;
            const nextButton = document.createElement('a');
            nextButton.href = '#';
            nextButton.textContent = 'Next';
            nextButton.addEventListener('click', async function (e) {
                e.preventDefault();
                document.getElementById('topic-container').innerHTML = ''; // Clear topics container

                // Fetch topics for clicked page
                let response = await fetch(`${BASE_URL}/topic/?machine__department=${selectedDepartment}&page=${nextPage}`);
                let topics = await response.json();
                topics.results.forEach(topic => {
                    addTopicItem(topic.id, topic.label);
                });

                // Load the next page
                generatePagination(nextPage, totalPages);
            });
            container.appendChild(nextButton);
        }
    }

    // Call this function with the initial page and total pages from your API response
    generatePagination(1, totalPages); // Assuming 'totalPages' is defined somewhere in your code
}


document.getElementById("add-new-topic-button").addEventListener("click", function () {
    redirectToPage('../admin-panel.html?tab=' + selectedDepartment);
})
window.onload = () => setupPagination();