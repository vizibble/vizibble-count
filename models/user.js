const { query } = require("../service/db");

const GetTelemetryHits = async (deviceID, startIST) => {
    try {
        const queryText = `
            WITH hours AS (
                SELECT generate_series(
                    $1::timestamp,
                    $1::timestamp + interval '23 hours',
                    interval '1 hour'
                ) AS hour
            ),
            products AS (
                SELECT id, name FROM device_products WHERE device_id = $2
            ),
            hours_products AS (
                SELECT h.hour, p.id as product_id, p.name as product_name
                FROM hours h
                CROSS JOIN products p
            ),
            hits AS (
                SELECT
                    date_trunc('hour', timestamp AT TIME ZONE 'Asia/Kolkata') AS hour,
                    product_id,
                    COUNT(*) AS count
                FROM
                    telemetry
                WHERE
                    device_id = $2
                    AND (timestamp AT TIME ZONE 'Asia/Kolkata') >= $1::timestamp
                    AND (timestamp AT TIME ZONE 'Asia/Kolkata') < ($1::timestamp + interval '1 day')
                GROUP BY
                    1, 2
            )
            SELECT
                to_char(hp.hour, 'YYYY-MM-DD HH24:00:00') AS hour,
                hp.product_id,
                hp.product_name,
                COALESCE(t.count, 0) AS count
            FROM
                hours_products hp
                LEFT JOIN hits t ON hp.hour = t.hour AND hp.product_id = t.product_id
            ORDER BY
                hp.product_id, hp.hour;
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