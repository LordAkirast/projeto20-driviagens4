import { db } from '../database/database.connection.js';

const findCityByName = async (name) => {
    const query = 'SELECT * FROM cities WHERE name = $1';
    const result = await db.query(query, [name]);
    return result.rows[0]; 
}

const createCity = async (name) => {
    const query = 'INSERT INTO cities (name) VALUES ($1) RETURNING *';
    const result = await db.query(query, [name]);
    return result.rows[0]; 
}

export { findCityByName, createCity };
