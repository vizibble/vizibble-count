const redis = require("../service/redis");
const {
    getDeviceData,
    insertNewDeviceQuery,
    insertTelemetryQuery
} = require("../Database/Data_from_device");

function emitToFrontend(req, data) {
    try {
        const socket = req.app.get('socket');
        if (socket) socket.emit("update", data);
        else console.warn(`[${new Date().toLocaleString("en-GB", { timeZone: "Asia/Kolkata" })}] No socket connection for device ${data.connectionID}.`);
    } catch (err) {
        console.error(`[${new Date().toLocaleString("en-GB", { timeZone: "Asia/Kolkata" })}] Error emitting data for machine ${data.connectionID}: ${err.message}`);
    }
}

const getTimestamp = () => new Date().toISOString();

const handleDataFromDevice = async (req, res) => {
    const connectionID = req.params.id;
    const timestamp = getTimestamp();

    const istNow = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
    const redisKey = `eastmenDevices:${connectionID}`;
    let deviceCount = 0;
    try {
        const redisValue = await redis.get(redisKey);

        if (redisValue != null) {
            deviceCount = parseInt(redisValue, 10) + 1;
            await redis.set(redisKey, deviceCount);
        } else {
            const dbValue = await getDeviceData(connectionID);
            if (dbValue) {
                deviceCount = parseInt(dbValue.count, 10) + 1;
            } else {
                await insertNewDeviceQuery(connectionID, `Device ${connectionID}`);
                deviceCount = 1;
            }
            const now = new Date(istNow);
            const midnightIST = new Date(now);
            midnightIST.setHours(24, 0, 0, 0);
            const ttlSeconds = Math.floor((midnightIST - now) / 1000);
            await redis.set(redisKey, deviceCount, 'EX', ttlSeconds);
        }
        await insertTelemetryQuery(connectionID);
        emitToFrontend(req, { connectionID, deviceCount, timestamp });
        return res.status(200).json({ message: "Data processed successfully" });
    } catch (error) {
        console.error(`[${timestamp}] Error processing data for ${connectionID}: ${error.message}`);
        return res.status(500).json({ error: "Failed to process data" });
    }
};

module.exports = { handleDataFromDevice };