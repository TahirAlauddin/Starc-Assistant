import ApiService from './apiService';

class FileService extends ApiService {
    async uploadFile(url, file) {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${this.baseURL}${url}`, {
            method: 'POST',
            body: formData,
            // Note: Don't set Content-Type header for FormData; the browser does it automatically
        });

        if (!response.ok) {
            const jsonResponse = await response.json();
            throw new Error(jsonResponse.error || 'File upload failed');
        }

        return await response.json();
    }
}

export default FileService;
