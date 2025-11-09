const { query } = require("../service/db");
const { getISTDates, sumCounts } = require("../Database/utils");

const Get_Device_Data_Query = async (deviceID) => {
    const { current, previous } = getISTDates();

    const [currentHits, previousHits, meta] = await Promise.all([
        GetTelemetryHits(deviceID, current),
        GetTelemetryHits(deviceID, previous),
        GetDeviceMeta(deviceID)
    ]);

    const todayTotal = sumCounts(currentHits);
    const yesterdayTotal = sumCounts(previousHits);

    const todayMap = {};
    currentHits.forEach(hit => {
        const hour = new Date(hit.hour).getHours();
        if (!todayMap[hour]) todayMap[hour] = [];
        if (hit.count > 0) {
            todayMap[hour].push({
                product_id: hit.product_id,
                product_name: hit.product_name,
                count: Number(hit.count)
            });
        }
    });

    const yesterdayMap = {};
    previousHits.forEach(hit => {
        const hour = new Date(hit.hour).getHours();
        if (!yesterdayMap[hour]) yesterdayMap[hour] = [];
        if (hit.count > 0) {
            yesterdayMap[hour].push({
                product_id: hit.product_id,
                product_name: hit.product_name,
                count: Number(hit.count)
            });
        }
    });

    const uniqueHourStrings = [...new Set(currentHits.map(h => h.hour))].sort();

    const data = uniqueHourStrings.map(hourString => {
        const hour = new Date(hourString).getHours();
        return {
            hour: hourString,
            todayCount: todayMap[hour] || [],
            yesterdayCount: yesterdayMap[hour] || []
        }
    });

    const percentageDiff =
        yesterdayTotal > 0
            ? ((todayTotal - yesterdayTotal) / yesterdayTotal) * 100
            : todayTotal > 0 ? 100 : 0;

    return {
        data,
        comparison: {
            today: todayTotal,
            yesterday: yesterdayTotal,
            percentage: Number(percentageDiff.toFixed(2))
        },
        meta: {
            operator: meta.operator,
            machine_name: meta.machine_name,
            product: meta.product
        }
    };
};

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
        throw new Error(error);
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
        throw new Error(error);
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
        throw new Error(error);
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
        throw new Error(error);
    }
};

module.exports = { Get_Device_Data_Query, Get_All_Ids_Query, Get_Records_Data_Query };