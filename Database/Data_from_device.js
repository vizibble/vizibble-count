const client = require("../service/db");

async function getDeviceData(connectionID) {
    const { rows } = await client.query(
        `SELECT
            COUNT(t.device_id) AS count
        FROM
            device_info d
        LEFT JOIN
            telemetry_data t ON t.device_id = d.device_id
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
}

/**
 * Insert a new device into device_info table.
 */
async function insertNewDeviceQuery(connectionID, name = "Unnamed Device") {
    await client.query(
        `INSERT INTO device_info (connection_id, device_name)
        VALUES ($1, $2)`,
        [connectionID, name]
    );
}

/**
 * Insert a telemetry record for the given device using its connection ID.
 */
async function insertTelemetryQuery(connectionID) {
    await client.query(
        `INSERT INTO telemetry_data (device_id)
         SELECT device_id FROM device_info WHERE connection_id = $1`,
        [connectionID]
    );
}

module.exports = {
    getDeviceData,
    insertNewDeviceQuery,
    insertTelemetryQuery,
};
