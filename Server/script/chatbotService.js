// chatbotService.js
import ApiService from './apiService';

class ChatbotService extends ApiService {
    getResponse(query) {
        return this.post('/chatbot_model/', { query });
    }
}


