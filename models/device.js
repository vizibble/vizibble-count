const sql = require("../service/db");

async function Get_Device_Info_Query(connectionID) {
    try {
        const rows = await sql`
            SELECT id FROM devices WHERE connection_id = ${connectionID}
        `;
        return rows.length > 0 ? rows[0] : null;
    } catch (error) {
        throw new Error(error);
    }
}

async function Insert_Telemetry_Query(deviceID, productName) {
    try {
        const rows = await sql`
            SELECT id FROM device_products WHERE device_id = ${deviceID} AND name = ${productName}
        `;

        await sql`
            INSERT INTO telemetry (device_id, product_id)
            VALUES (
                ${deviceID},
                (SELECT id FROM device_products WHERE device_id = ${deviceID} AND name = ${productName})
            )
        `;
    } catch (error) {
        throw new Error(error);
    }
}

module.exports = {
    Get_Device_Info_Query,
    Insert_Telemetry_Query
};