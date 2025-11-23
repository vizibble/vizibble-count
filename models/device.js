const { query } = require("../service/db");

async function Get_Device_Info_Query(connectionID) {
    try {
        const queryText = `
            SELECT id FROM devices WHERE connection_id = $1
        `;
        const { rows } = await query(queryText, [connectionID]);
        return rows.length > 0 ? rows[0] : null;
    } catch (error) {
        throw error;
    }
}

async function Insert_Telemetry_Query(deviceID, productName) {
    try {
        const queryText = `
            INSERT INTO telemetry (device_id, product_id)
            VALUES (
                $1,
                (SELECT id FROM device_products WHERE device_id = $2 AND name = $3)
            )
        `;
        await query(queryText, [deviceID, deviceID, productName]);
    } catch (error) {
        throw error;
    }
}

async function Device_Permission_Query(userID, connectionID) {
    try {
        const queryText = `
            SELECT id FROM devices WHERE user_id = $1 AND connection_id = $2
        `;
        const { rows } = await query(queryText, [userID, connectionID]);
        return rows.length > 0;
    } catch (error) {
        throw error;
    }
}

module.exports = {
    Get_Device_Info_Query,
    Insert_Telemetry_Query,
    Device_Permission_Query
};
