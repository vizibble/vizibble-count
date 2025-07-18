const client = require("../service/db");

const Get_Historical_Data = async (connectionID) => {
    const [hitsRows, meta] = await Promise.all([
        GetTelemetryHits(connectionID),
        GetDeviceMeta(connectionID)
    ]);

    let todayTotal = 0;
    let yesterdayTotal = 0;

    const data = hitsRows.map(row => {
        const todayHits = Number(row.hits_today);
        const yesterdayHits = Number(row.hits_yesterday);
        todayTotal += todayHits;
        yesterdayTotal += yesterdayHits;
        return {
            hour: row.hour_slot_ist,
            todayHits: todayHits,
            yesterdayHits: yesterdayHits
        };
    });

    const percentageDiff = yesterdayTotal > 0
        ? ((todayTotal - yesterdayTotal) / yesterdayTotal) * 100
        : todayTotal > 0 ? 100 : 0;

    return {
        data,
        comparison: {
            today: todayTotal,
            yesterday: yesterdayTotal,
            percentage: percentageDiff
        },
        meta: {
            product: meta.product,
            operator: meta.operator,
            machine_name: meta.machine_name
        }
    };
};

async function Get_All_Ids_Query() {
    try {
        const { rows } = await client.query("SELECT connection_id FROM devices");
        return rows;
    }
    catch (error) {
        throw new Error(error.message);
    }
}

const GetDeviceMeta = async (connectionID) => {
    const query = `
        SELECT
            dd.product,
            dd.operator,
            dd.name as machine_name
        FROM
            device_details dd
        JOIN
            devices d ON d.id = dd.device_id
        WHERE
            d.connection_id = $1
        LIMIT 1
    `;
    const result = await client.query(query, [connectionID]);
    return result.rows[0] || null;
};

const GetTelemetryHits = async (connectionID) => {
    const query = `
        WITH hours AS (
            SELECT generate_series(
                date_trunc('day', now() AT TIME ZONE 'Asia/Kolkata') + INTERVAL '6 hour',
                date_trunc('day', now() AT TIME ZONE 'Asia/Kolkata') + INTERVAL '30 hour' - INTERVAL '1 hour',
                INTERVAL '1 hour'
            ) AS hour_slot_ist
        ),
        telemetry_hits_today AS (
            SELECT
                date_trunc('hour', t.timestamp AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Kolkata') AS hour_slot_ist,
                COUNT(*) AS hits
            FROM telemetry t
            JOIN devices d ON d.id = t.device_id
            WHERE d.connection_id = $1
                AND t.timestamp >= (date_trunc('day', now() AT TIME ZONE 'Asia/Kolkata') + INTERVAL '6 hour') AT TIME ZONE 'Asia/Kolkata' AT TIME ZONE 'UTC'
                AND t.timestamp < (date_trunc('day', now() AT TIME ZONE 'Asia/Kolkata') + INTERVAL '30 hour') AT TIME ZONE 'Asia/Kolkata' AT TIME ZONE 'UTC'
                AND t.timestamp < now()
            GROUP BY hour_slot_ist
        ),
        telemetry_hits_yesterday AS (
            SELECT
                date_trunc('hour', t.timestamp AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Kolkata') AS hour_slot_ist,
                COUNT(*) AS hits
            FROM
                telemetry t
            JOIN
                devices d ON d.id = t.device_id
            WHERE
                d.connection_id = $1
                AND t.timestamp >= (
                    date_trunc('day', now() AT TIME ZONE 'Asia/Kolkata' - INTERVAL '1 day') + INTERVAL '6 hour'
                ) AT TIME ZONE 'Asia/Kolkata' AT TIME ZONE 'UTC'
                AND t.timestamp < (
                    date_trunc('day', now() AT TIME ZONE 'Asia/Kolkata' - INTERVAL '1 day')
                    + INTERVAL '6 hour'
                    + (date_trunc('hour', now() AT TIME ZONE 'Asia/Kolkata') - date_trunc('day', now() AT TIME ZONE 'Asia/Kolkata'))
                ) AT TIME ZONE 'Asia/Kolkata' AT TIME ZONE 'UTC'
            GROUP BY
                hour_slot_ist
        )
        SELECT
            h.hour_slot_ist,
            COALESCE(tht.hits, 0) AS hits_today,
            COALESCE(thy.hits, 0) AS hits_yesterday
        FROM hours h
        LEFT JOIN telemetry_hits_today tht ON h.hour_slot_ist = tht.hour_slot_ist
        LEFT JOIN telemetry_hits_yesterday thy ON h.hour_slot_ist = (thy.hour_slot_ist + INTERVAL '1 day')
        ORDER BY h.hour_slot_ist
    `;
    const result = await client.query(query, [connectionID]);
    return result.rows;
};


module.exports = { Get_Historical_Data, Get_All_Ids_Query }