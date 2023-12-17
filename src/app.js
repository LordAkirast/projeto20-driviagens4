import express from "express";
import { v4 as uuid } from "uuid";
import cors from "cors";
import Joi from "joi";
import dayjs from "dayjs";
import bcrypt from "bcrypt"
import { db } from "./database/database.connection.js";
import moment from "moment";

const app = express();
app.use(cors());
app.use(express.json());



const createPassenger = Joi.object({
    firstName: Joi.string().min(2).max(100).required(),
    lastName: Joi.string().min(2).max(100).required(),
});

const createCities = Joi.object({
    name: Joi.string().min(2).max(50).required(),
});

const createFlights = Joi.object({
    origin: Joi.number().integer().min(1).required(),
    destination: Joi.number().integer().min(1).required(),
    date: Joi.date().required(),
});

const createTravels = Joi.object({
    passengerId: Joi.number().integer().min(1).required(),
    flightId: Joi.number().integer().min(1).required(),
});



function getCurrentTimestamp() {
    return dayjs().format('YYYY-MM-DD HH:mm:ss');
}

const createdAt = getCurrentTimestamp();
console.log(createdAt);

app.post('/test', (req, res) => {
    console.log('OK')
    return res.status(200).send('OK')
})

app.post('/passengers', async (req, res) => {
    const { firstName, lastName } = req.body

    console.log('SUCCESS ON ENTERING')

    try {
        console.log('ENTERING TRY')

        const validation = createPassenger.validate({ firstName, lastName }, { abortEarly: false });
        if (validation.error) {
            const errors = validation.error.details.map((detail) => detail.message);
            return res.status(422).json(errors);
        }

        console.log('PASSED TRY VALIDATION')

        const userVerify = await db.query('SELECT * FROM PASSENGERS where firstname = $1 AND lastname = $2;', [firstName, lastName]);
        console.log('PASSED USER VERIFY SELECT')
        if (userVerify.rows.length > 0) {
            return res.status(409).send('There is a passenger already with this name and last name!');
        } else {

            console.log('PASSED USER VERIFY VALIDATION')
            const passenger = await db.query('INSERT INTO passengers (firstname, lastname) values ($1, $2);', [firstName, lastName]);
            console.log('PASSENGER CREATED!')

            const userData = await db.query('SELECT * FROM PASSENGERS where firstname = $1 AND lastname = $2;', [firstName, lastName]);

            const data = {
                id: userData.rows[0].id,
                firstName: userData.rows[0].firstname,
                lastName: userData.rows[0].lastname,
            };


            return res.status(201).send(data);
        }
    } catch (err) {
        console.log('ERROR PARTICIPANTS')
        return res.status(500).send(err.message);
    }

})

// Rota para excluir todos os registros da tabela 'passengers'
app.post('/passengers/delete', async (req, res) => {
    try {
        const result = await db.query('DELETE FROM passengers');

        const rowCount = result.rowCount;

        res.status(200).json({ message: `Reset completo. ${rowCount} registros excluídos.` });
    } catch (error) {
        console.error('Erro ao excluir registros da tabela de passageiros:', error.message);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});


// Rota para excluir todos os registros da tabela 'cities'
app.post('/cities/delete', async (req, res) => {
    try {
        const result = await db.query('DELETE FROM cities');

        const rowCount = result.rowCount;

        res.status(200).json({ message: `Reset completo. ${rowCount} registros excluídos.` });
    } catch (error) {
        console.error('Erro ao excluir registros da tabela de cities:', error.message);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});


app.post('/cities', async (req, res) => {
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

})




app.post('/flights', async (req, res) => {
    const { origin, destination, date } = req.body;

    // Verifica se a data recebida está no formato esperado
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
        // Coloque aqui a lógica de validação do esquema (schema) se necessário

        console.log('PASSED SCHEMA - Flights');
        console.log(origin, destination, formattedDate);

        // Consulta para verificar a existência da cidade de origem
        const citiesVerify = await db.query('SELECT * FROM CITIES WHERE id = $1;', [origin]);

        // Consulta para verificar a existência da cidade de destino
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
            // Inserir o voo no banco de dados
            const flights = await db.query('INSERT INTO flights (origin, destination, date) VALUES ($1, $2, $3);', [origin, destination, formattedDate]);
            console.log('FLIGHT CREATED!');

            // Consulta para obter os detalhes do voo recém-criado
            const flightsVerify = await db.query('SELECT * FROM FLIGHTS WHERE origin = $1 AND destination = $2 AND date = $3;', [origin, destination, formattedDate]);

            const data = {
                id: flightsVerify.rows[0].id,
                origin: flightsVerify.rows[0].origin,
                destination: flightsVerify.rows[0].destination,
                date: formattedDate, // Use a data formatada
            };

            return res.status(201).json(data);
        }
    } catch (err) {
        console.log(' failure - FLights');
        return res.status(500).send(err.message);
    }
});




app.post('/travels', async (req, res) => {
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
            const travelsVerify = await db.query('SELECT * FROM TRAVELS WHERE passengerId = $1 AND flightId = $2;', [passengerId, flightId]);
            console.log('TRAVEL CREATED!')
            const data = {
                id: travelsVerify.rows.id,
                passengerId: travelsVerify.rows.passengerId,
                flightId: travelsVerify.rows.flightId,
            }
            return res.status(201).send(data);
        }
    } catch (err) {
        return res.status(500).send(err.message);
    }

})

app.get('/flights', async (req, res) => {

    try {
        const { origin } = req.query;
        const { destination } = req.query;
        let flights;

        if (origin) {
            flights = await db.query('SELECT * FROM flights WHERE origin = $1 ORDER BY date DESC;', [origin]);
        } else if (destination) {
            flights = await db.query('SELECT * FROM flights WHERE destination = $1 ORDER BY date DESC;', [destination]);
        } else if (destination && origin) {
            flights = await db.query('SELECT * FROM flights WHERE destination = $1 AND origin = $2 ORDER BY date DESC;', [destination, origin]);
        } else {
            flights = await db.query('SELECT * FROM flights ORDER BY date DESC;');
        }

        res.status(200).json(flights.rows);
    } catch (err) {
        return res.status(500).send(err.message);
    }
});

app.get('/passengers/travels', async (req, res) => {
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
});


const port = process.env.PORT || 5000
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`)
})

export default app;
