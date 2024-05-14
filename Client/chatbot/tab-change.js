function loadTornituraTab() {
    let selectedClass = "selected-department-box";

    if (currentMainContainer != "base") {
        clearMainDiv();
        createDepartmentMain();

        currentMainContainer = "base";
    }

    document.getElementById("departments-title").textContent =
        "Tornitura Department";
    addOptionsToDropdown("Tornitura");

    tornituraTab.classList.add(selectedClass);
    tornituraObject.setAttribute("data", "../images/Tornitura-Selected.svg");

    if (rettificheTab.classList.contains(selectedClass)) {
        rettificheObject.setAttribute("data", "../images/Rettifiche.svg");
    }
    if (qualitaTab.classList.contains(selectedClass)) {
        qualitaObject.setAttribute("data", "../images/Qualita.svg");
    }

    rettificheTab.classList.remove(selectedClass);
    qualitaTab.classList.remove(selectedClass);
}

function loadRettificheTab() {
    let selectedClass = "selected-department-box";

    if (currentMainContainer != "base") {
        clearMainDiv();
        createDepartmentMain();

        currentMainContainer = "base";
    }

    document.getElementById("departments-title").textContent =
        "Rettifiche Department";

    addOptionsToDropdown("Rettifiche");

    rettificheTab.classList.add(selectedClass);
    rettificheObject.setAttribute("data", "../images/Rettifiche-Selected.svg");

    if (tornituraTab.classList.contains(selectedClass)) {
        tornituraObject.setAttribute("data", "../images/Tornitura.svg");
    }

    if (qualitaTab.classList.contains(selectedClass)) {
        qualitaObject.setAttribute("data", "../images/Qualita.svg");
    }

    tornituraTab.classList.remove(selectedClass);
    qualitaTab.classList.remove(selectedClass);
}

function loadQualitaTab() {
    let selectedClass = "selected-department-box";

    if (currentMainContainer != "base") {
        clearMainDiv();
        createDepartmentMain();

        currentMainContainer = "base";
    }

    document.getElementById("departments-title").textContent =
        "Control Qualita Department";
    addOptionsToDropdown("Qualita");

    qualitaTab.classList.add(selectedClass);
    qualitaObject.setAttribute("data", "../images/Qualita-Selected.svg");

    if (tornituraTab.classList.contains(selectedClass)) {
        tornituraObject.setAttribute("data", "../images/Tornitura.svg");
    }

    if (rettificheTab.classList.contains(selectedClass)) {
        rettificheObject.setAttribute("data", "../images/Rettifiche.svg");
    }

    tornituraTab.classList.remove(selectedClass);
    rettificheTab.classList.remove(selectedClass);
}

tornituraTab.addEventListener("click", loadTornituraTab);

rettificheTab.addEventListener("click", loadRettificheTab);

qualitaTab.addEventListener("click", loadQualitaTab);

document.addEventListener("DOMContentLoaded", function () {
    let csrfToken = document.querySelector("[name=csrfmiddlewaretoken]");
    if (csrfToken) {
        csrfToken = csrfToken.value;
    }
    var url = new URL(window.location.href);
    var tab = url.searchParams.get("tab");

    if (tab == "rettifiche") {
        loadRettificheTab();
    } else if (tab == "qualita") {
        loadQualitaTab();
    } else if (tab == "tornitura") {
        loadTornituraTab();
    } else {
        loadTornituraTab();
    }
});
