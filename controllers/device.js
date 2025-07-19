const redis = require("../service/redis");
const { getDeviceData, insertNewDeviceQuery, insertTelemetryQuery } = require("../Database/device");

function emitToFrontend(req, data) {
    try {
        console.log("hello in backend")
        const socket = req.app.get('socket');
        if (socket) socket.emit("update", data);
        else console.warn(`[${getISTTime()}] No socket connection for device ${data.connectionID}.`);
    } catch (err) {
        console.error(`[${getISTTime()}] Error emitting data for machine ${data.connectionID}: ${err.message}`);
    }
}

const getISTTime = () => new Date().toLocaleString("en-GB", { timeZone: "Asia/Kolkata" });
const getTimestamp = () => new Date().toISOString();

const getTTL = () => {
    const nowIST = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
    const resetTime = new Date(nowIST);
    resetTime.setHours(6, 0, 0, 0);

    if (nowIST >= resetTime) {
        resetTime.setDate(resetTime.getDate() + 1);
    }

    return Math.floor((resetTime - nowIST) / 1000);
};


const handleDataFromDevice = async (req, res) => {
    const connectionID = req.params.id;
    const timestamp = getTimestamp();
    const redisKey = `count:${connectionID}`;
    let deviceCount = 0;
    try {
        const redisValue = await redis.get(redisKey);
        if (redisValue !== null) {
            deviceCount = parseInt(redisValue, 10) + 1;
            await redis.set(redisKey, deviceCount);
        } else {
            const deviceData = await getDeviceData(connectionID);
            if (deviceData) {
                deviceCount = parseInt(deviceData.count || '0', 10) + 1;
            } else {
                await insertNewDeviceQuery(connectionID, `Device ${connectionID}`);
                deviceCount = 1;
            }
            const ttl = getTTL();
            await redis.set(redisKey, deviceCount, 'EX', ttl);
        }
        await insertTelemetryQuery(connectionID);
        emitToFrontend(req, { connectionID, deviceCount, timestamp });
        return res.status(200).json({ message: "Data processed successfully" });
    } catch (error) {
        console.error(`[${timestamp}] Error processing data for device ${connectionID}: ${error.message}`);
        return res.status(500).json({ error: "Failed to process data" });
    }
};

module.exports = { handleDataFromDevice };