import { db } from "../database/database.connection.js"
import { createPassenger } from "../schemas/schemas.js"

const postPassengers = async (req, res) => {
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

}

export default postPassengers;