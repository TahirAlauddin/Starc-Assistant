// answerService.js
import ApiService from './apiService';

class AnswerService extends ApiService {
    constructor(baseURL) {
        super(baseURL);
    }

    getAllAnswers() {
        return this.get('/answers/');
    }

    getAnswer(id) {
        return this.get(`/answers/${id}/`);
    }

    createAnswer(data) {
        return this.post('/answers/', data);
    }

    updateAnswer(id, data) {
        return this.put(`/answers/${id}/`, data);
    }

    deleteAnswer(id) {
        return this.delete(`/answers/${id}/`);
    }
}

export default AnswerService;
