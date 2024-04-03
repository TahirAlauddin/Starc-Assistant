// machineService.js
import ApiService from './apiService';

class MachineService extends ApiService {
    constructor(baseURL) {
        super(baseURL);
    }

    getAllMachines() {
        return this.get('/machines/');
    }

    getMachine(id) {
        return this.get(`/machines/${id}/`);
    }

    createMachine(data) {
        return this.post('/machines/', data);
    }

    updateMachine(id, data) {
        return this.put(`/machines/${id}/`, data);
    }

    deleteMachine(id) {
        return this.delete(`/machines/${id}/`);
    }
}

export default MachineService;
