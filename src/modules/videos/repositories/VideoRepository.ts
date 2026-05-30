import fs from 'fs';
import path from 'path';
import { pool } from '../../../mysql';
import { PoolConnection } from 'mysql2';
import { v4 as uuidv4 } from 'uuid';
import { hash, compare } from 'bcrypt';
import { sign } from 'jsonwebtoken';
import { Request, Response } from 'express';
import { getPalette } from 'colorthief';

async function GetColor(imagePath: string) {
    if (!imagePath) return;

    const palette = await getPalette(imagePath, { colorCount: 6 });
    if (!palette) return;

    const mostVibrant = palette.reduce((prev, current) => {
        return current.hsl().s > prev.hsl().s ? current : prev;
    });
    const { h, s, l } = mostVibrant.hsl();
    return `[${h}, ${s}, ${l}]`
}

class VideoRepository {
    async create(request: any, response: Response) {
        const { title, description, user_id, date, views } = request.body;

        const files = request.files as { [fieldname: string]: any };
        const image = files['image']?.[0]?.filename;
        const video = files['video']?.[0]?.filename;

        const imagePath = path.join(__dirname, '../../../../uploads/images', image);
        const color = await GetColor(imagePath)

        pool.getConnection((err: any, connection: PoolConnection) => {

            connection.query(
                'INSERT INTO videos (video_id, user_id, title, description, date, views, image, video, image_color) VALUES (?,?,?,?,?,?,?,?,?)',
                [uuidv4(), user_id, title, description, date, views, image, video, color],
                (error: any, result: any, fields: any) => {
                    connection.release();
                    if (error) {
                        return response.status(400).json(error)
                    }
                    response.status(200).json({ message: 'Video criado com sucesso' });
                }
            )
        })
    }

    getVideo(request: Request, response: Response) {
        const { video_id } = request.query;
        pool.getConnection((err: any, connection: PoolConnection) => {

            connection.query(
                `SELECT videos.*, users.name as user_name 
                FROM videos 
                JOIN users ON videos.user_id = users.user_id
                WHERE videos.video_id LIKE ?`,
                [video_id],
                (error: any, results: any) => {
                    connection.release();
                    if (error) {
                        return response.status(400).json({ error: "Erro ao buscar os vídeos!" })
                    }

                    return response.status(200).json({ message: 'Vídeos retornados com sucesso', videos: results })

                }
            )
        })
    }


    searchVideos(request: Request, response: Response) {
        const { search } = request.query;
        pool.getConnection((err: any, connection: PoolConnection) => {

            connection.query(
                `SELECT videos.*, users.name as user_name 
                FROM videos 
                JOIN users ON videos.user_id = users.user_id
                WHERE videos.title LIKE ?`,
                [`%${search}%`],
                (error: any, results: any) => {
                    connection.release();
                    if (error) {
                        return response.status(400).json({ error: "Erro ao buscar os vídeos!" })
                    }

                    return response.status(200).json({ message: 'Vídeos retornados com sucesso', videos: results })

                }
            )
        })
    }

    addViews(request: Request, response: Response) {
        const { video_id } = request.body;
        pool.getConnection((err: any, connection: PoolConnection) => {

            connection.query(
                'UPDATE videos SET views = views + 1 WHERE video_id = ?',
                [video_id],
                (error: any, results: any, fields: any) => {
                    connection.release();
                    if (error) {
                        return response.status(400).json({ error: "Erro ao adicionar view" })
                    }

                    return response.status(200).json({ message: 'View adicionado com sucesso', results: results })

                }
            )
        })
    }

    streamVideo(request: Request, response: Response) {
        const filename = request.params.filename as string;
        const videoPath = path.join(__dirname, '../../../../uploads/videos', filename);

        if (!fs.existsSync(videoPath)) {
            return response.status(404).json({ message: 'Vídeo não encontrado' });
        }

        const stat = fs.statSync(videoPath);
        const fileSize = stat.size;
        const range = request.headers.range;

        if (range) {
            const parts = range.replace(/bytes=/, '').split('-');
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
            const chunkSize = end - start + 1;

            const fileStream = fs.createReadStream(videoPath, { start, end });

            response.writeHead(206, {
                'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': chunkSize,
                'Content-Type': 'video/mp4',
            });

            fileStream.pipe(response);
        } else {
            response.writeHead(200, {
                'Content-Length': fileSize,
                'Content-Type': 'video/mp4',
            });

            fs.createReadStream(videoPath).pipe(response);
        }
    }
}

export { VideoRepository };