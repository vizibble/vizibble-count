const sql = require("../service/db");

async function getDeviceData(connectionID) {
    try {
        const rows = await sql`
            SELECT id
            FROM devices d
            WHERE d.connection_id = ${connectionID}
        `;
        return rows.length > 0;
    } catch (error) {
        throw new Error(error);
    }
}

async function insertNewDeviceQuery(connectionID) {
    try {
        await sql`
            INSERT INTO devices (connection_id)
            VALUES (${connectionID})
        `;
    } catch (error) {
        throw new Error(error);
    }
}

async function insertTelemetryQuery(connectionID) {
    try {
        await sql`
            INSERT INTO telemetry (device_id)
            SELECT id FROM devices WHERE connection_id = ${connectionID}
        `;
    } catch (error) {
        throw new Error(error);
    }
}

module.exports = {
    getDeviceData,
    insertNewDeviceQuery,
    insertTelemetryQuery,
};