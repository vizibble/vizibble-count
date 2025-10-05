const { Get_Device_Info_Query, Insert_Telemetry_Query } = require("../models/device");

const deviceLastRequest = new Map();

function emitToFrontend(req, data, event) {
    try {
        const socket = req.app.get('socket');
        if (socket) socket.emit(event, data);
        else console.warn(`[${getISTTime()}] No socket connection for device ${data.connectionID}.`);
    } catch (err) {
        console.error(`[${getISTTime()}] Error emitting data for machine ${data.connectionID}: ${err.message}`);
    }
}

const getISTTime = () => new Date().toLocaleString("en-GB", { timeZone: "Asia/Kolkata" });
const getTimestamp = () => new Date().toISOString();

const handleDataFromDevice = async (req, res) => {
    const connectionID = req.params.id;
    const { status, product } = req.body;
    const timestamp = getTimestamp();

    try {
        if (status === 'LOW') {
            emitToFrontend(req, { connectionID }, "status");
            return res.status(200).json({ message: "Low status received and emitted" });
        } else if (status === 'ALIVE') {
            return res.status(200).json({ message: "Alive status received successfully" });
        } else {
            const productName = product;

            let deviceData = await Get_Device_Info_Query(connectionID);
            if (!deviceData) {
                return res.status(500).json({ error: "Unknown Device" });
            }

            const now = Date.now();
            const lastRequestTime = deviceLastRequest.get(connectionID);
            if (lastRequestTime && now - lastRequestTime < 5000) {
                return res.status(429).json({ error: "Too many requests. Please wait 5 seconds." });
            }
            deviceLastRequest.set(connectionID, now);

            await Insert_Telemetry_Query(deviceData.id, productName);

            emitToFrontend(req, { connectionID, timestamp, product: productName }, "update");

            return res.status(200).json({ message: "Data processed successfully" });
        }
    } catch (error) {
        console.error(`[${timestamp}] Error processing data for device ${connectionID}: ${error.message}`);
        return res.status(500).json({ error: "Failed to process data" });
    }
};


module.exports = { handleDataFromDevice };
