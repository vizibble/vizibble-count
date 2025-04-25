const client = require("../service/db");

const Get_Historical_Data = async (connectionID) => {
    const query = `
    SELECT
        DATE(t.timestamp AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Kolkata') AS day,
        COUNT(*) AS hits
    FROM
        telemetry_data t
    JOIN
        device_info d ON d.device_id = t.device_id
    WHERE
        d.connection_id = $1
        AND (t.timestamp AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Kolkata') >= (CURRENT_DATE - INTERVAL '1 month') AT TIME ZONE 'Asia/Kolkata'
        AND (t.timestamp AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Kolkata') < (CURRENT_DATE + INTERVAL '1 day') AT TIME ZONE 'Asia/Kolkata'
    GROUP BY
        day
    ORDER BY
        day;
`;
    const result = await client.query(query, [connectionID]);
    return result.rows;
};

async function Get_All_Ids_Query() {
    try {
        const { rows } = await client.query("SELECT connection_id FROM device_info");
        return rows;
    }
    catch (error) {
        throw new Error(error.message);
    }
}

module.exports = { Get_Historical_Data, Get_All_Ids_Query }