const client = require("../service/redis");
const { getISTTime } = require("../utils/time");

const deviceRateLimiter = async (req, res, next) => {
    const { status } = req.body;
    const connectionID = req.params.id;

    if (status === 'HIGH') {
        const key = `device-req:${connectionID}`;
        const reply = await client.set(key, '1', 'EX', 5, 'NX');

        if (reply === null) {
            console.log(`[${getISTTime()}] Rate limit hit for device ${connectionID}`);
            return res.status(429).json({ error: "Too many requests. Please wait 5 seconds." });
        }
    }

    next();
};

module.exports = { deviceRateLimiter };