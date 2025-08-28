
const bcrypt = require('bcrypt');
const { Get_User_By_Email_Query } = require('../models/auth');
const { JWTGeneration } = require('../service/userAutehntication');
require('dotenv').config();


const displayLogin = async (req, res) => {
    try {
        const token = req.cookies.token

        if (token) {
            return res.status(200).redirect("/user");
        }
        return res.status(200).render("login.ejs");
    } catch (err) {
        return res.status(200).render("login.ejs");
    }
};

const validateLogin = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await Get_User_By_Email_Query(email);
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const token = JWTGeneration(user.id);
        res.cookie("token", token, {
            httpOnly: true,
            sameSite: 'None',
            secure: true,
        })
        return res.status(200).redirect('/user')
    } catch (error) {
        console.error(`[${new Date().toLocaleString('en-GB')}] Error logging in user: ${error.message}`);
        res.status(500).json({ error: 'Internal server error while logging in user.' });
    }
};

module.exports = { displayLogin, validateLogin };
