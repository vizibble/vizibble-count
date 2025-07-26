const pool = require("../service/db");

async function getDeviceData(connectionID) {
    try {
        const { rows } = await pool.query(
            `SELECT
            COUNT(t.device_id) AS count
        FROM
            devices d
        LEFT JOIN
            telemetry t ON t.device_id = d.id
        AND
            t.timestamp >= (CURRENT_DATE AT TIME ZONE 'Asia/Kolkata' AT TIME ZONE 'UTC')
        AND
            t.timestamp < ((CURRENT_DATE + INTERVAL '1 day') AT TIME ZONE 'Asia/Kolkata' AT TIME ZONE 'UTC')
        WHERE
            d.connection_id = $1
        `,
            [connectionID]
        );
        return rows[0].count > 0 ? rows[0] : null;
    } catch (error) {
        throw new Error(error)
    }
}

/**
 * Insert a new device into device_info table.
 */
async function insertNewDeviceQuery(connectionID) {
    try {
        await pool.query(
            `INSERT INTO devices (connection_id)
            VALUES ($1)`,
            [connectionID]
        );
    } catch (error) {
        throw new Error(error)
    }
}

/**
 * Insert a telemetry record for the given device using its connection ID.
 */
async function insertTelemetryQuery(connectionID) {
    try {
        await pool.query(
            `INSERT INTO telemetry (device_id)
            SELECT id FROM devices WHERE connection_id = $1`,
            [connectionID]
        );
    } catch (error) {
        throw new Error(error)
    }
}

module.exports = {
    getDeviceData,
    insertNewDeviceQuery,
    insertTelemetryQuery,
};