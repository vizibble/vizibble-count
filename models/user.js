const { query } = require("../service/db");

const GetTelemetryHits = async (deviceID, startIST) => {
    try {
        const queryText = `
            WITH RECURSIVE hours AS (
                SELECT $1::timestamp AS hour
                UNION ALL
                SELECT hour + interval '1 hour'
                FROM hours
                WHERE hour < $1::timestamp + interval '23 hours'
            ),
            hits AS (
                SELECT
                    date_trunc(
                        'hour',
                        timestamp AT TIME ZONE 'Asia/Kolkata'
                    ) AS hour,
                    product_id,
                    COUNT(*) AS count
                FROM telemetry
                WHERE
                    device_id = $2
                    AND timestamp >= ($1 AT TIME ZONE 'Asia/Kolkata') AT TIME ZONE 'UTC'
                    AND timestamp < (($1 + interval '1 day') AT TIME ZONE 'Asia/Kolkata') AT TIME ZONE 'UTC'
                GROUP BY 1, 2
                )
                SELECT
                    to_char(h.hour, 'YYYY-MM-DD HH24:00:00') AS hour,
                    p.id AS product_id,
                    p.name AS product_name,
                    COALESCE(t.count, 0) AS count
                FROM hours h
                CROSS JOIN (
                    SELECT id, name
                    FROM device_products
                    WHERE device_id = $2
                ) p
                LEFT JOIN hits t
                    ON t.hour = h.hour
                    AND t.product_id = p.id
                ORDER BY p.id, h.hour;
            `;
        const { rows } = await query(queryText, [startIST, deviceID]);
        return rows;
    } catch (error) {
        throw error;
    }
};

const GetDeviceMeta = async (ID) => {
    try {
        const queryText = `
            SELECT
                dd.product,
                dd.operator,
                dd.name as machine_name
            FROM
                device_details dd
            JOIN
                devices d ON d.id = dd.device_id
            WHERE
                d.id = $1
            LIMIT 1;
        `;
        const { rows } = await query(queryText, [ID]);
        return rows[0] || {};
    } catch (error) {
        throw error;
    }
};

const Get_All_Ids_Query = async (userId) => {
    try {
        const queryText = `
            SELECT 
                connection_id, 
                id 
            FROM 
                devices
            WHERE
                user_id = $1
        `;
        const { rows } = await query(queryText, [userId]);
        return rows
    } catch (error) {
        throw error;
    }
};


const Get_Records_Data_Query = async (userID) => {
    try {
        const queryText = `
            SELECT
                dpc.production_date AS date,
                dp.name AS name,
                dpc.piece_count AS count
            FROM
                daily_production_counts AS dpc
            JOIN
                device_products AS dp ON dpc.product_id = dp.id
            JOIN
                devices AS d ON dp.device_id = d.id
            WHERE
                d.user_id = $1
            ORDER BY
                dpc.production_date DESC,
                dp.name ASC;
        `;
        const { rows } = await query(queryText, [userID]);
        return rows;
    } catch (error) {
        throw error;
    }
};

module.exports = { GetTelemetryHits, GetDeviceMeta, Get_All_Ids_Query, Get_Records_Data_Query };