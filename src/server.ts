import express from 'express';
import { userRoutes } from './routes/user.routes';
import { videosRoutes } from './routes/videos.route';
import { config } from 'dotenv';

config();
const app = express();

app.use(express.json());
app.use('/user', userRoutes);
app.use('/videos', videosRoutes);


app.listen(4000);