import express from 'express';
import postCities from '../controllers/cities.controller.js';

const router = express.Router();

// Rota para criar uma nova cidade
router.post('/', postCities);

export default router;
