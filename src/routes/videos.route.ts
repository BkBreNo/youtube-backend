import { Router } from 'express';
import { VideoRepository } from '../modules/videos/repositories/VideoRepository';
import { login } from '../middleware/login';
import { upload } from '../middleware/upload';

const videosRoutes = Router();
const videoRepository = new VideoRepository();

videosRoutes.post('/create-video', login, upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'video', maxCount: 1 }
]), (request, response) => {
    videoRepository.create(request, response);
})

videosRoutes.get('/get-video', (request, response) => {
    videoRepository.getVideo(request, response);
})

videosRoutes.get('/search', (request, response) => {
    videoRepository.searchVideos(request, response);
})

videosRoutes.post('/addviews', (request, response) => {
    videoRepository.addViews(request, response);
})

videosRoutes.get('/stream/:filename', (request, response) => {
    videoRepository.streamVideo(request, response);
})

export { videosRoutes };