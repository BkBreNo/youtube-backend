import { pool } from '../../../mysql';
import { v4 as uuidv4 } from 'uuid';
import { hash, compare } from 'bcrypt';
import { sign } from 'jsonwebtoken';
import { Request, Response } from 'express';

class VideoRepository {
    create(request: any, response: Response) {
        const { title, description, user_id, date, views } = request.body;
        const image = request.file?.filename;

        pool.getConnection((err: any, connection: any) => {

            connection.query(
                'INSERT INTO videos (video_id, user_id, title, description, date, views, image) VALUES (?,?,?,?,?,?,?)',
                [uuidv4(), user_id, title, description, date, views, image],
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

    getVideos(request: Request, response: Response) {
        const { user_id } = request.query;
        pool.getConnection((err: any, connection: any) => {

            connection.query(
                'SELECT * FROM videos WHERE user_id = ?',
                [user_id],
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
        pool.getConnection((err: any, connection: any) => {

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
        pool.getConnection((err: any, connection: any) => {

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

}

export { VideoRepository };