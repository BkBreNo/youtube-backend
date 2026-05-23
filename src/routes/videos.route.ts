import { Router } from 'express';
import { VideoRepository } from '../modules/videos/repositories/VideoRepository';
import { login } from '../middleware/login';
import { upload } from '../middleware/upload';

const videosRoutes = Router();
const videoRepository = new VideoRepository();

videosRoutes.post('/create-video', login, upload.single('image'), (request, response) => {
    videoRepository.create(request, response);
})

videosRoutes.get('/get-videos', (request, response) => {
    videoRepository.getVideos(request, response);
})

videosRoutes.get('/search', (request, response) => {
    videoRepository.searchVideos(request, response);
})

videosRoutes.post('/addviews', (request, response) => {
    videoRepository.addViews(request, response);
})

export { videosRoutes };