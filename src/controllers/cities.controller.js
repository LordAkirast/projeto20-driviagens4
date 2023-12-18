import { createCities } from "../schemas/schemas.js";
import { db } from "../database/database.connection.js";


const postCities = async (req, res) => {
    const { name } = req.body

    console.log('SUCCESS ON ENTERING')

    try {

        const validation = createCities.validate({ name }, { abortEarly: false });
        if (validation.error) {
            const errors = validation.error.details.map((detail) => detail.message);
            return res.status(422).json(errors);
        }

        const citiesVerify = await db.query('SELECT * FROM CITIES where name = $1;', [name]);
        if (citiesVerify.rows.length > 0) {
            return res.status(409).send('There is a city already with this name!');
        } else {
            const city = await db.query('INSERT INTO cities (name) values ($1);', [name]);
            console.log('CITY CREATED!')

            const citiesData = await db.query('SELECT * FROM CITIES where name = $1;', [name]);

            const data = {
                id: citiesData.rows[0].id,
                name: citiesData.rows[0].name,
            };


            return res.status(201).send(data);
        }
    } catch (err) {
        return res.status(500).send(err.message);
    }

}

export default postCities;