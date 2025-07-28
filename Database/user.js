const pool = require("../service/db");
const { getISTDates, sumCounts } = require("./utils");

const Get_Historical_Data = async (ID) => {
    const { current, previous } = getISTDates();

    const [currentHits, previousHits, meta] = await Promise.all([
        GetTelemetryHits(ID, current),
        GetTelemetryHits(ID, previous),
        GetDeviceMeta(ID)
    ]);

    const todayTotal = sumCounts(currentHits);
    const yesterdayTotal = sumCounts(previousHits);

    const data = currentHits.map((entry, index) => {
        return {
            hour: entry.hour,
            todayCount: Number(entry.count),
            yesterdayCount: Number(previousHits[index].count)
        };
    })
    const percentageDiff =
        yesterdayTotal > 0
            ? ((todayTotal - yesterdayTotal) / yesterdayTotal) * 100
            : todayTotal > 0 ? 100 : 0;

    return {
        data: data,
        comparison: {
            today: todayTotal,
            yesterday: yesterdayTotal,
            percentage: Number(percentageDiff.toFixed(2))
        },
        meta: {
            product: meta.product,
            operator: meta.operator,
            machine_name: meta.machine_name
        }
    };
};

const GetTelemetryHits = async (ID, startIST) => {
    try {
        const query = `
            WITH hours AS (
                SELECT generate_series(
                    $2::timestamp,
                    $2::timestamp + interval '23 hours',
                    interval '1 hour'
                ) AS hour
            ),
            hits AS (
                SELECT
                    date_trunc('hour', timestamp AT TIME ZONE 'Asia/Kolkata') AS hour,
                    COUNT(*) AS count
                FROM
                    telemetry
                WHERE
                    device_id = $1
                    AND (timestamp AT TIME ZONE 'Asia/Kolkata') >= $2::timestamp
                    AND (timestamp AT TIME ZONE 'Asia/Kolkata') < ($2::timestamp + interval '1 day')
                GROUP BY
                    1
            )
            SELECT
                to_char(h.hour, 'YYYY-MM-DD HH24:00:00') AS hour,
                COALESCE(t.count, 0) AS count
            FROM
                hours h
                LEFT JOIN hits t ON h.hour = t.hour
            ORDER BY
                h.hour;
        `;
        const { rows } = await pool.query(query, [ID, startIST]);
        return rows;
    } catch (error) {
        throw new Error(error);
    }
};

const GetDeviceMeta = async (ID) => {
    try {
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
                d.id = $1
            LIMIT 1;
        `;
        const result = await pool.query(query, [ID]);
        return result.rows[0] || {};
    } catch (error) {
        throw new Error(error);
    }
};

const Get_All_Ids_Query = async () => {
    try {
        const { rows } = await pool.query("SELECT connection_id, id FROM devices");
        return rows;
    } catch (error) {
        throw new Error(error);
    }
};

const Get_Records_Data = async () => {
    try {
        const query = `
                SELECT
                    dd.name AS name,
                    dp.id AS id,
                    dp.date AS date,
                    dp.total_pieces AS count
                FROM
                    daily_pieces dp
                JOIN
                    device_details dd ON dd.device_id = dp.device_id;
            `;
        const result = await pool.query(query);
        return result.rows;
    } catch (error) {
        throw new Error(error);
    }
};

module.exports = { Get_Historical_Data, Get_All_Ids_Query, Get_Records_Data };