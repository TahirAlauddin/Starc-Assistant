// trainingService.js

class TrainingService extends ApiService {
    constructor(baseURL) {
        super(baseURL);
    }

    getAllTrainings() {
        return this.get('/trainings/');
    }

    getTraining(id) {
        return this.get(`/trainings/${id}/`);
    }

    createTraining(data) {
        return this.post('/trainings/', data);
    }

    updateTraining(id, data) {
        return this.put(`/trainings/${id}/`, data);
    }

    deleteTraining(id) {
        return this.delete(`/trainings/${id}/`);
    }
}

export default TrainingService;
