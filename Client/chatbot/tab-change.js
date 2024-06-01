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
        tornituraObject.classList.add("selected-svg-fill")
        
    if (rettificheTab.classList.contains(selectedClass)) {
        rettificheObject.classList.remove("selected-svg-fill")
    }
    if (qualitaTab.classList.contains(selectedClass)) {
        qualitaObject.classList.remove("selected-svg-stroke")
    }

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
        rettificheObject.classList.add("selected-svg-fill")
        
    if (tornituraTab.classList.contains(selectedClass)) {
        tornituraObject.classList.remove("selected-svg-fill")
    }

    if (qualitaTab.classList.contains(selectedClass)) {
        qualitaObject.classList.remove("selected-svg-stroke")
    }
    
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
        qualitaObject.classList.add("selected-svg-stroke")
        
        if (tornituraTab.classList.contains(selectedClass)) {
            tornituraObject.classList.remove("selected-svg-fill")
        }
        
        if (rettificheTab.classList.contains(selectedClass)) {
            rettificheObject.classList.remove("selected-svg-fill")
    }

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
