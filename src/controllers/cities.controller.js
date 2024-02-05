import { createCities } from "../schemas/schemas.js";
import { db } from "../database/database.connection.js";

import { validateCityName } from "../services/cities.services.js";
import { findCityByName } from "../repositories/cities.repository.js";
import { createCity } from "../repositories/cities.repository.js";

const postCities = async (req, res) => {
    const { name } = req.body;

    try {
        const { error } = validateCityName(name);
        if (error) {
            return res.status(422).json({ error: error.details[0].message });
        }

        const existingCity = await findCityByName(name);
        if (existingCity) {
            return res.status(409).send('There is a city already with this name!');
        }

        const newCity = await createCity(name);

        return res.status(201).json({
            id: newCity.id,
            name: newCity.name
        });
    } catch (err) {
        return res.status(500).send(err.message);
    }
}

export default postCities;