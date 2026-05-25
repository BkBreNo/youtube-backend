import { pool } from '../../../mysql';
import { PoolConnection } from 'mysql2';
import { v4 as uuidv4 } from 'uuid';
import { hash, compare } from 'bcrypt';
import { sign, verify } from 'jsonwebtoken';
import { Request, Response } from 'express';

class UserRepository {
    create(request: Request, response: Response) {
        const { name, email, password } = request.body;
        pool.getConnection((err: any, connection: PoolConnection) => {
            if (err) {
                console.error('Erro de conexão:', err);
                return response.status(500).json({ message: 'Erro ao conectar com o banco', error: err.message, code: err.code });
            }

            hash(password, 10, (err, hash) => {
                if (err) {
                    return response.status(500).json({ error: err, message: 'Não foi possível criar a conta. Tente novamente' })
                }

                connection.query(
                    'INSERT INTO users (user_id, name, email, password) VALUES (?,?,?,?)',
                    [uuidv4(), name, email, hash],
                    (error: any, result: any, fields: any) => {
                        connection.release();
                        if (error) {
                            return response.status(400).json({ error: error, message: 'Este email já está cadastrado' })
                        }
                        response.status(200).json({ message: 'Usúario cadastrado com sucesso!' });
                    }
                )
            })
        })
    }




    login(request: Request, response: Response) {
        const { email, password } = request.body;
        pool.getConnection((err: any, connection: PoolConnection) => {

            connection.query(
                'SELECT * FROM users WHERE email = ?',
                [email],
                (error: any, results: any, fields: any) => {
                    connection.release();
                    if (error) {
                        return response.status(400).json({ error: "Erro na sua autenticação!" })
                    }

                    compare(password, results[0].password, (err, result) => {
                        if (err) {
                            return response.status(400).json({ error: "Erro na sua autenticação!" })
                        }

                        if (result) {

                            const token = sign({
                                id: results[0].user_id,
                                email: results[0].email,
                            }, process.env.SECRET as string, { expiresIn: "1d" })

                            return response.status(200).json({ token: token, message: 'Autenticado com sucesso' })
                        }
                    })
                }
            )
        })
    }

    getUser(request: Request, response: Response) {
        const decode: any = verify(request.headers.authorization as string, process.env.SECRET as string);
        if (decode.email) {
            pool.getConnection((error, conn: PoolConnection) => {
                conn.query(
                    'SELECT * FROM users WHERE email = ?',
                    [decode.email],
                    (error, results) => {
                        const rows = results as any[];
                        conn.release();
                        if (error) {
                            return response.status(400).json({ error: error, response: null })
                        }

                        return response.status(201).send({
                            user: {
                                nome: rows[0].name,
                                email: rows[0].email,
                                id: rows[0].user_id,
                            }
                        })
                    }
                )
            })
        }
    }
}

export { UserRepository };