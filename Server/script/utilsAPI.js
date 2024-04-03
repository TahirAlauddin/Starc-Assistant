// In your main application or component file

function showError(error) {
    // Implement UI logic to show error messages
    console.error(error);
}

function showLoading(isLoading) {
    // Implement UI logic to show or hide loading indicator
    console.log(isLoading ? 'Loading...' : 'Done');
}

async function performApiCall() {
    showLoading(true);
    try {
        const data = await departmentService.getAllDepartments();
        console.log(data);
        // Update UI with data
    } catch (error) {
        showError(error);
    } finally {
        showLoading(false);
    }
}
