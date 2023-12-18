
import { createTravels } from "../schemas/schemas.js";
import { db } from "../database/database.connection.js";

const postTravels = async (req, res) => {
    const { passengerId, flightId } = req.body

    console.log('SUCCESS ON ENTERING - travels')

    try {

        const validation = createTravels.validate({ passengerId, flightId }, { abortEarly: false });
        if (validation.error) {
            const errors = validation.error.details.map((detail) => detail.message);
            return res.status(422).json(errors);
        }

        const flightsVerify = await db.query('SELECT * FROM flights where id = $1;', [flightId]);
        const passengerVerify = await db.query('SELECT * FROM passengers where id = $1;', [passengerId]);
        if (flightsVerify.rows.length === 0) {
            return res.status(404).send('Flight not found!');
        } else if (passengerVerify.rows.length === 0) {
            return res.status(404).send('Passenger not found!');
        } else {
            const travels = await db.query('INSERT INTO travels (passengerId,flightId ) values ($1, $2);', [passengerId, flightId]);
            const travelData = await db.query('SELECT * FROM TRAVELS WHERE passengerId = $1 AND flightId = $2;', [passengerId, flightId]);
            console.log('TRAVEL CREATED!')
            const data = {
                id: travelData.rows[0].id,
                passengerId: travelData.rows[0].passengerid,
                flightId: travelData.rows[0].flightid,
            }
            return res.status(201).send(data);
        }
    } catch (err) {
        return res.status(500).send(err.message);
    }

}

export default postTravels;