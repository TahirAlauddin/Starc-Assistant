let tornituraTab = document.getElementById("department-tornitura");
let rettificheTab = document.getElementById("department-rettifiche");
let qualitaTab = document.getElementById("department-qualita");


document.addEventListener("DOMContentLoaded", async function () {
    let user = sessionStorage.getItem('isAdmin')
    if (user) {

        // If user is logged in as admin, don't show login page.
        document.getElementById('admin-panel-button').style.display = 'none'

        tornituraTab.setAttribute(
            "onclick",
            "redirectToPage('../admin/admin-panel.html?tab=tornitura')"
        );
        rettificheTab.setAttribute(
            "onclick",
            "redirectToPage('../admin/admin-panel.html?tab=rettifiche')"
        );
        qualitaTab.setAttribute(
            "onclick",
            "redirectToPage('../admin/admin-panel.html?tab=qualita')");
    } else {
        tornituraTab.setAttribute(
            "onclick",
            "redirectToPage('../chatbot/main.html?tab=tornitura')"
        );
        rettificheTab.setAttribute(
            "onclick",
            "redirectToPage('../chatbot/main.html?tab=rettifiche')"
        );
        qualitaTab.setAttribute(
            "onclick",
            "redirectToPage('../chatbot/main.html?tab=qualita')"
        );
    }


})