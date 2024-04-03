let tornituraTab = document.getElementById("department-tornitura");
let rettificheTab = document.getElementById("department-rettifiche");
let qualitaTab = document.getElementById("department-qualita");

var tornituraObject = document.querySelector('#department-tornitura object');
var rettificheObject = document.querySelector('#department-rettifiche object');
var qualitaObject = document.querySelector('#department-qualita object');
var selectedDepartment = 1;

function setTornituraTab(selectedClass) {
    document.getElementById("admin-heading").textContent =
        "Tornitura";
    addOptionsToDropdown("Tornitura");

    tornituraTab.classList.add(selectedClass);
    tornituraObject.setAttribute('data', '../images/Tornitura-Selected.svg');

    rettificheObject.setAttribute('data', '../images/Rettifiche.svg');
    qualitaObject.setAttribute('data', '../images/Qualita.svg');

    rettificheTab.classList.remove(selectedClass);
    qualitaTab.classList.remove(selectedClass);

    selectedDepartment = 1
}

function setRettificheTab(selectedClass) {
    document.getElementById("admin-heading").textContent =
        "Rettifiche";

    addOptionsToDropdown("Rettifiche");

    rettificheTab.classList.add(selectedClass);
    rettificheObject.setAttribute('data', '../images/Rettifiche-Selected.svg');

    tornituraObject.setAttribute('data', '../images/Tornitura.svg');
    qualitaObject.setAttribute('data', '../images/Qualita.svg');

    tornituraTab.classList.remove(selectedClass);
    qualitaTab.classList.remove(selectedClass);
    selectedDepartment = 2

}

function setQualitaTab(selectedClass) {
    document.getElementById("admin-heading").textContent =
        "Control Qualita";
    addOptionsToDropdown("Qualita");

    qualitaTab.classList.add(selectedClass);
    qualitaObject.setAttribute('data', '../images/Qualita-Selected.svg');

    tornituraObject.setAttribute('data', '../images/Tornitura.svg');
    rettificheObject.setAttribute('data', '../images/Rettifiche.svg');

    tornituraTab.classList.remove(selectedClass);
    rettificheTab.classList.remove(selectedClass);

    selectedDepartment = 3
}

// For Tornitura
tornituraTab.addEventListener("click", function () {
    let selectedClass = "selected-department-box";

    if (!tornituraTab.classList.contains(selectedClass)) {
        setTornituraTab(selectedClass);
    }

});

// For Rettifiche
rettificheTab.addEventListener("click", function () {
    let selectedClass = "selected-department-box";

    if (!rettificheTab.classList.contains(selectedClass)) {
        setRettificheTab(selectedClass);
    }

});

// For Qualita
qualitaTab.addEventListener("click", function () {
    let selectedClass = "selected-department-box";

    if (!qualitaTab.classList.contains(selectedClass)) {
        setQualitaTab(selectedClass);
    }
});

document.addEventListener('DOMContentLoaded', function () {
    let selectedClass = "selected-department-box";

    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);

    let tab = urlParams.get("tab");

    if (tab == 1) {
        setTornituraTab(selectedClass);
 
     }
     else if (tab == 2) {
         setRettificheTab(selectedClass);
     }
 
     else if (tab == 3) {
         setQualitaTab(selectedClass);
     }
})