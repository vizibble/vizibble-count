const { Get_Device_Info_Query, Insert_Telemetry_Query } = require("../models/device");
const { getTimestamp } = require("../utils/time");
const { emitToFrontend } = require("../service/socket");

const handleDataFromDevice = async (req, res) => {
    const connectionID = req.params.id;
    const { status, product } = req.body;
    const timestamp = getTimestamp();
    const room = `device-${connectionID}`;

    try {
        if (status === 'LOW') {
            emitToFrontend(room, "status", { connectionID });
            return res.status(200).json({ message: "Low status received and emitted" });
        } else if (status === 'ALIVE') {
            return res.status(200).json({ message: "Alive status received successfully" });
        } else {
            const data = await Get_Device_Info_Query(connectionID);
            if (!data) return res.status(500).json({ error: "Unknown Device" });

            await Insert_Telemetry_Query(data.id, product);

            emitToFrontend(room, "update", { connectionID, timestamp, product });

            return res.status(200).json({ message: "Data processed successfully" });
        }
    } catch (error) {
        console.error(`[${timestamp}] Error processing data for device ${connectionID}:`, error);
        return res.status(500).json({ error: "Failed to process data" });
    }
};

module.exports = { handleDataFromDevice };
