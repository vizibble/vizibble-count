
const bcrypt = require('bcrypt');
const { Get_User_By_Email_Query } = require('../models/auth');
const { JWTGeneration, JWTVerification } = require('../service/userAutehntication.js');
const { getTimestamp } = require('../utils/time.js');
require('dotenv').config();

const displayLogin = async (req, res) => {
    try {
        const token = req.cookies.token;
        if (!token)
            return res.status(200).render("login.ejs");

        const decoded = JWTVerification(token);
        if (decoded) {
            return res.status(200).redirect("/user/widgets");
        } else {
            res.clearCookie("token");
            return res.status(200).render("login.ejs");
        }

    } catch (err) {
        console.error(`[${getTimestamp()}] Error displaying login:`, err);
        return res.status(500).render("login.ejs");
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
        const token = JWTGeneration({ id: user.id });
        res.cookie("token", token, {
            httpOnly: true,
            sameSite: "None",
            secure: true,
            maxAge: 30 * 24 * 60 * 60 * 1000,
        });
        return res.status(200).redirect('/user/widgets')
    } catch (error) {
        console.error(`[${getTimestamp()}] Error logging in user:`, error);
        res.status(500).json({ error: 'Internal server error while logging in user.' });
    }
};

module.exports = { displayLogin, validateLogin };
