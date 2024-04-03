// apiService.js

class ApiService {
    constructor(baseURL) {
        this.baseURL = baseURL;
    }

    async request(url, method = 'GET', data = null) {
        const headers = new Headers({
            'Content-Type': 'application/json',
            // Include additional headers here, e.g., Authorization for JWT
        });

        const config = {
            method: method,
            headers: headers,
            body: data ? JSON.stringify(data) : null,
        };

        if (method === 'GET' || method === 'HEAD') {
            delete config.body;
        }

        try {
            const response = await fetch(`${this.baseURL}${url}`, config);
            const jsonResponse = await response.json();
            if (!response.ok) {
                throw new Error(jsonResponse.error || 'Unknown error occurred');
            }
            return jsonResponse;
        } catch (error) {
            console.error(`Error during ${method} request to ${url}: ${error}`);
            throw error; // Rethrow to let caller handle it
        }
    }

    get(url) {
        return this.request(url);
    }

    post(url, data) {
        return this.request(url, 'POST', data);
    }

    put(url, data) {
        return this.request(url, 'PUT', data);
    }

    delete(url) {
        return this.request(url, 'DELETE');
    }
}

export default ApiService;