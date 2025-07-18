const client = require("../service/db");

function getISTDates() {
    const now = new Date();

    const formatter = new Intl.DateTimeFormat("en-IN", {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        hour12: false
    });

    const parts = formatter.formatToParts(now);
    const year = parts.find(p => p.type === 'year').value;
    const month = parts.find(p => p.type === 'month').value;
    const day = parts.find(p => p.type === 'day').value;
    const hour = parseInt(parts.find(p => p.type === 'hour').value);

    let todayDate = new Date(`${year}-${month}-${day}T00:00:00`);
    let today6AM, yesterday6AM;

    if (hour >= 6) {
        today6AM = new Date(todayDate);
        yesterday6AM = new Date(todayDate);
        yesterday6AM.setDate(yesterday6AM.getDate() - 1);
    } else {
        today6AM = new Date(todayDate);
        today6AM.setDate(today6AM.getDate() - 1);
        yesterday6AM = new Date(today6AM);
        yesterday6AM.setDate(yesterday6AM.getDate() - 1);
    }

    function formatIST6AM(dateObj) {
        const y = dateObj.getFullYear();
        const m = String(dateObj.getMonth() + 1).padStart(2, '0');
        const d = String(dateObj.getDate()).padStart(2, '0');
        return `${y}-${m}-${d} 06:00:00`;
    }

    return {
        current: formatIST6AM(today6AM),
        previous: formatIST6AM(yesterday6AM)
    };
}

const Get_Historical_Data = async (ID) => {
    const { current, previous } = getISTDates();

    const [currentHits, previousHits, meta] = await Promise.all([
        GetTelemetryHits(ID, current),
        GetTelemetryHits(ID, previous),
        GetDeviceMeta(ID)
    ]);
    let todayTotal = 0;
    let yesterdayTotal = 0;

    for (const row of previousHits) {
        const count = Number(row.count);
        yesterdayTotal += count;
    }
    for (const row of currentHits) {
        const count = Number(row.count);
        todayTotal += count;
    }

    const percentageDiff = yesterdayTotal > 0
        ? ((todayTotal - yesterdayTotal) / yesterdayTotal) * 100
        : todayTotal > 0 ? 100 : 0;

    return {
        data: currentHits,
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
        const { rows } = await client.query(query, [ID, startIST]);
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
        const result = await client.query(query, [ID]);
        return result.rows[0] || {};
    } catch (error) {
        throw new Error(error);
    }
};

const Get_All_Ids_Query = async () => {
    try {
        const { rows } = await client.query("SELECT connection_id, id FROM devices");
        return rows;
    } catch (error) {
        throw new Error(error);
    }
};

module.exports = { Get_Historical_Data, Get_All_Ids_Query };