const sql = require("../service/db");

async function Get_Device_Info_Query(connectionID) {
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

async function Insert_New_Device_Query(connectionID) {
    try {
        await sql`
            INSERT INTO devices (connection_id)
            VALUES (${connectionID})
        `;
    } catch (error) {
        throw new Error(error);
    }
}

async function Insert_Telemetry_Query(connectionID) {
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
    Get_Device_Info_Query,
    Insert_New_Device_Query,
    Insert_Telemetry_Query,
};