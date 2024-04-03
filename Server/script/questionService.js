// questionService.js
import ApiService from './apiService';

class QuestionService extends ApiService {
    constructor(baseURL) {
        super(baseURL);
    }

    getAllQuestions() {
        return this.get('/questions/');
    }

    getQuestion(id) {
        return this.get(`/questions/${id}/`);
    }

    createQuestion(data) {
        return this.post('/questions/', data);
    }

    updateQuestion(id, data) {
        return this.put(`/questions/${id}/`, data);
    }

    deleteQuestion(id) {
        return this.delete(`/questions/${id}/`);
    }
}

export default QuestionService;
