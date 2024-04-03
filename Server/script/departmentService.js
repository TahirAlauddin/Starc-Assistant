// departmentService.js
import ApiService from './apiService';

class DepartmentService extends ApiService {
    constructor(baseURL) {
        super(baseURL);
    }

    getAllDepartments() {
        return this.get('/departments/');
    }

    getDepartmentById(id) {
        return this.get(`/departments/${id}/`);
    }

    createDepartment(data) {
        return this.post('/departments/', data);
    }

    updateDepartment(id, data) {
        return this.put(`/departments/${id}/`, data);
    }

    deleteDepartment(id) {
        return this.delete(`/departments/${id}/`);
    }
}

// Usage example
const departmentService = new DepartmentService('http://your-api-url.com');
departmentService.getAllDepartments()
    .then(data => console.log(data))
    .catch(error => console.error(error));

    // In departmentService.js
export default DepartmentService;
