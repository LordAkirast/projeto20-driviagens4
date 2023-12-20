
import { createFlights } from "../schemas/schemas.js";
import { db } from "../database/database.connection.js";
import moment from "moment";
import dayjs from "dayjs";

const postFlights = async (req, res) => {
    const { origin, destination, date } = req.body;

    const isValidDate = moment(date, 'DD-MM-YYYY', true).isValid();

    if (!isValidDate) {
        return res.status(422).send('Invalid date format. Please use DD-MM-YYYY.');
    }

    // Formatar a data usando moment
    const formattedDate = moment(date, 'DD-MM-YYYY').format('YYYY-MM-DD');

    const createdAt = getCurrentTimestamp();

    console.log('SUCCESS ON ENTERING - Flights');
    console.log(date);
    console.log(formattedDate);

    try {

        console.log('PASSED SCHEMA - Flights');
        console.log(origin, destination, formattedDate);

        const citiesVerify = await db.query('SELECT * FROM CITIES WHERE id = $1;', [origin]);

        const citiesDestinationVerify = await db.query('SELECT * FROM CITIES WHERE id = $1;', [destination]);

        console.log('PASSED CONST VERIFIES - FLights');
        if (citiesVerify.rows.length === 0) {
            console.log('origin city not found');
            return res.status(404).send('Origin city not found!');
        } else if (citiesDestinationVerify.rows.length === 0) {
            console.log('destiny city not found');
            return res.status(404).send('Destiny city not found!');
        } else if (origin === destination) {
            console.log('origin and destiny shall be different');
            return res.status(409).send('Origin and Destination needs to have different values!');
        } else if (date < createdAt) {
            return res.status(422).send('Date must be higher than the actual date.');
        } else {
            console.log('PASSED VERIFICATIONS IF ELSE - FLights');

            const flights = await db.query('INSERT INTO flights (origin, destination, date) VALUES ($1, $2, $3);', [origin, destination, formattedDate]);
            console.log('FLIGHT CREATED!');


            const flightsVerify = await db.query('SELECT * FROM FLIGHTS WHERE origin = $1 AND destination = $2 AND date = $3;', [origin, destination, formattedDate]);

            const data = {
                id: flightsVerify.rows[0].id,
                origin: flightsVerify.rows[0].origin,
                destination: flightsVerify.rows[0].destination,
                date: formattedDate,
            };

            return res.status(201).json(data);
        }
    } catch (err) {
        console.log(' failure - FLights');
        return res.status(500).send(err.message);
    }
};

const getFlights = async (req, res) => {
    try {
        let query = 'SELECT flights.id, origin.name as origin, destination.name as destination, flights.date FROM flights';
        query += ' INNER JOIN cities AS origin ON flights.origin = origin.id';
        query += ' INNER JOIN cities AS destination ON flights.destination = destination.id';


        if (req.query.origin) {
            query += ` WHERE origin.name = '${req.query.origin}'`;
        }


        if (req.query.destination) {
            query += `${req.query.origin ? ' AND' : ' WHERE'} destination.name = '${req.query.destination}'`;
        }


        query += ' ORDER BY flights.date';

        const flightsData = await db.query(query);

        const flights = flightsData.rows.map((flight) => ({
            id: flight.id,
            origin: flight.origin,
            destination: flight.destination,
            date: flight.date.toISOString().split('T')[0],
        }));

        return res.status(200).json(flights);
    } catch (err) {
        console.log('failure - Flights:', err.message);
        return res.status(500).send(err.message);
    }
}


export { postFlights, getFlights };
