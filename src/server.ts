import express from 'express';
import { userRoutes } from './routes/user.routes';
import { videosRoutes } from './routes/videos.route';
import { config } from 'dotenv';
import path from 'path';
config();

const app = express();

const cors = require('cors');

app.use(function(req, res, next) {
    res.header("Acess-Control-Allow-Origin", "*");
    res.header("Acess-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Acess-Control-Allow-Methods", "POST, GET, PATCH, DELETE, OPTIONS");
    next();
});

app.use(cors());

app.use(express.json());
app.use('/user', userRoutes);
app.use('/videos', videosRoutes);
app.use('/uploads', express.static('uploads/images/'));

app.listen(process.env.PORT);