import Joi from "joi";
import express from "express";
import { v4 as uuid } from "uuid";
import cors from "cors";
import dayjs from "dayjs";
import bcrypt from "bcrypt"
import { db } from "../database/database.connection.js";
import moment from "moment";


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


export { createPassenger, createCities, createFlights, createTravels };