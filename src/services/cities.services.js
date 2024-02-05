import Joi from 'joi';

const validateCityName = (name) => {
    const schema = Joi.string().min(3).max(50).required();
    return schema.validate(name);
}

export { validateCityName };
