function loadTornituraTab() {
    let selectedClass = "selected-department-box";

    if (currentMainContainer != "base") {
        clearMainDiv();
        createDepartmentMain();

        currentMainContainer = "base";
    }

    document.getElementById("departments-title").textContent =
        "Tornitura Department";


    tornituraTab.classList.add(selectedClass);
    tornituraObjectSelected.style.display = "block";
    tornituraObject.style.display = "none"

    if (rettificheTab.classList.contains(selectedClass)) {
        rettificheObject.style.display = "block"
    }
    
    if (qualitaTab.classList.contains(selectedClass)) {
        qualitaObject.style.display = "block"
    }
    
    rettificheObjectSelected.style.display = "none";
    qualitaObjectSelected.style.display = "none";
    rettificheTab.classList.remove(selectedClass);
    qualitaTab.classList.remove(selectedClass);

    addOptionsToDropdown("Tornitura");
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


    rettificheTab.classList.add(selectedClass);
    rettificheObjectSelected.style.display = "block";
    rettificheObject.style.display = "none"

    if (tornituraTab.classList.contains(selectedClass)) {
        tornituraObject.style.display = "block";
    }
    
    if (qualitaTab.classList.contains(selectedClass)) {
        qualitaObject.style.display = "block"
    }
    
    tornituraObjectSelected.style.display = "none";
    qualitaObjectSelected.style.display = "none";
    tornituraTab.classList.remove(selectedClass);
    qualitaTab.classList.remove(selectedClass);

    addOptionsToDropdown("Rettifiche");

}

function loadQualitaTab() {
    let selectedClass = "selected-department-box";

    if (currentMainContainer != "base") {
        clearMainDiv();
        createDepartmentMain();

        currentMainContainer = "base";
    }

    document.getElementById("departments-title").textContent =
        "Controllo Qualità Department";


    qualitaTab.classList.add(selectedClass);
    qualitaObjectSelected.style.display = "block";
    qualitaObject.style.display = "none"

    if (tornituraTab.classList.contains(selectedClass)) {
        tornituraObject.style.display = "block";
    }
    
    if (rettificheTab.classList.contains(selectedClass)) {
        rettificheObject.style.display = "block";
    }
    
    tornituraObjectSelected.style.display = "none";
    rettificheObjectSelected.style.display = "none";
    tornituraTab.classList.remove(selectedClass);
    rettificheTab.classList.remove(selectedClass);

    addOptionsToDropdown("Qualita");
}

document.addEventListener("DOMContentLoaded", function () {

    tornituraTab.addEventListener("click", loadTornituraTab);
    rettificheTab.addEventListener("click", loadRettificheTab);
    qualitaTab.addEventListener("click", loadQualitaTab);

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
