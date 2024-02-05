import express from "express";
import { v4 as uuid } from "uuid";
import cors from "cors";
import Joi from "joi";
import dayjs from "dayjs";
import bcrypt from "bcrypt"
import { db } from "./database/database.connection.js";
import moment from "moment";
import test from "./controllers/test.js";
import postTravels from "./controllers/travels.controller.js";
import { getFlights, postFlights } from "./controllers/flights.controller.js";
import postPasTravel from "./controllers/passengersTravel.controller.js";
import postPassengers from "./controllers/passsengers.controller.js";
import postCities from "./controllers/cities.controller.js";


const app = express();
app.use(cors());
app.use(express.json());


function getCurrentTimestamp() {
    return dayjs().format('YYYY-MM-DD HH:mm:ss');
}

const createdAt = getCurrentTimestamp();
console.log(createdAt);

app.post('/test', test)

app.post('/passengers', postPassengers)

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

//app.post('/cities', postCities)
app.use('/cities', postCities);

app.post('/flights', postFlights)

app.post('/travels', postTravels)

app.get('/flights', getFlights)

app.get('/passengers/travels', postPasTravel)

const port = process.env.PORT || 5000
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`)
})

export default app;
