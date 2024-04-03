// authService.js
import ApiService from './apiService';

class AuthService extends ApiService {
    login(username, password) {
        return this.post('/login/', { username, password });
    }

    logout() {
        return this.post('/logout/');
    }
}

export default AuthService;
