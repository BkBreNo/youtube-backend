import mysql, { Pool } from 'mysql2';
import { config } from 'dotenv';
config()

const pool: Pool = mysql.createPool({
    "user": process.env.USER_DATABASE,
    "password": process.env.PASSWORD_DATABASE,
    "database": process.env.DATABASE,
    "host": process.env.HOST_DATABASE,
    "port": Number(process.env.PORT_DATABASE),
})

export { pool };