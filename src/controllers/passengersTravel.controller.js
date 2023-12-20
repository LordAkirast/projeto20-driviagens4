import { db } from "../database/database.connection.js";

const postPasTravel = async (req, res) => {
    try {
        const { name } = req.query;
        let query;

        if (name) {
            query = `
                SELECT passengers.firstname || ' ' || passengers.lastname AS passenger,
                COALESCE(COUNT(travels.passengerid), 0) AS travels
                FROM passengers
                LEFT JOIN travels ON passengers.id = travels.passengerid
                WHERE passengers.firstname || ' ' || passengers.lastname ILIKE $1
                GROUP BY passengers.id
                ORDER BY travels DESC;
            `;
        } else {
            query = `
                SELECT passengers.firstname || ' ' || passengers.lastname AS passenger,
                COALESCE(COUNT(travels.passengerid), 0) AS travels
                FROM passengers
                LEFT JOIN travels ON passengers.id = travels.passengerid
                GROUP BY passengers.id
                ORDER BY travels DESC;
            `;
        }

        const queryParams = name ? [`%${name}%`] : [];

        const result = await db.query(query, queryParams);

        res.status(200).json(result.rows);
    } catch (err) {
        return res.status(500).send(err.message);
    }
}

export default postPasTravel;