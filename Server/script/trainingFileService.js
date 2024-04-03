// trainingFileService.js

class TrainingFileService extends ApiService {
    constructor(baseURL) {
        super(baseURL);
    }

    getAllTrainingFiles() {
        return this.get('/training-files/');
    }

    getTrainingFile(id) {
        return this.get(`/training-files/${id}/`);
    }

    createTrainingFile(data) {
        return this.post('/training-files/', data);
    }

    updateTrainingFile(id, data) {
        return this.put(`/training-files/${id}/`, data);
    }

    deleteTrainingFile(id) {
        return this.delete(`/training-files/${id}/`);
    }
}

export default TrainingFileService;
