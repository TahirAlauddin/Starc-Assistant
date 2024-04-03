// topicService.js
import ApiService from './apiService';

class TopicService extends ApiService {
    constructor(baseURL) {
        super(baseURL);
    }

    getAllTopics() {
        return this.get('/topics/');
    }

    getTopic(id) {
        return this.get(`/topics/${id}/`);
    }

    createTopic(data) {
        return this.post('/topics/', data);
    }

    updateTopic(id, data) {
        return this.put(`/topics/${id}/`, data);
    }

    deleteTopic(id) {
        return this.delete(`/topics/${id}/`);
    }
}

export default TopicService;
