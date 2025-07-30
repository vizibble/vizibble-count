const pool = require("../service/db");

async function getDeviceData(connectionID) {
    try {
        const { rows } = await pool.query(`
        SELECT
            id
        FROM
            devices d
        WHERE
            d.connection_id = $1
        `,
            [connectionID]
        );
        return rows.length > 0 ? true: false;
    } catch (error) {
        throw new Error(error)
    }
}

/**
 * Insert a new device into devices table.
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