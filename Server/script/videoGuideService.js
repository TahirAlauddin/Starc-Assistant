// videoGuideService.js

class VideoGuideService extends ApiService {
    constructor(baseURL) {
        super(baseURL);
    }

    getAllVideoGuides() {
        return this.get('/video-guides/');
    }

    getVideoGuide(id) {
        return this.get(`/video-guides/${id}/`);
    }

    createVideoGuide(data) {
        return this.post('/video-guides/', data);
    }

    updateVideoGuide(id, data) {
        return this.put(`/video-guides/${id}/`, data);
    }

    deleteVideoGuide(id) {
        return this.delete(`/video-guides/${id}/`);
    }
}

export default VideoGuideService;
