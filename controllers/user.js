const { Get_All_Ids_Query, Get_Records_Data_Query, GetTelemetryHits, GetDeviceMeta } = require("../models/user.js");
const { getISTDates, sumCounts, groupHitsByHour, calculatePercentageDiff, uniqueSortedHours } = require("../Database/utils");
const { getTimestamp } = require("../utils/time.js");
require("dotenv").config()

const displayHome = async (req, res) => {
    const userID = req.user
    try {
        const devices = await Get_All_Ids_Query(userID);
        return res.status(200).render("index.ejs", { names: devices });
    }
    catch (error) {
        console.error(`[${getTimestamp()}] Error fetching devices:`, error);
        return res.status(500).json({ error: "Internal server error while fetching devices." });
    }
};

const GetWidgetData = async (req, res) => {
    const { device } = req.query;
    try {
        const { current, previous } = getISTDates();

        const [currentHits, previousHits, meta] = await Promise.all([
            GetTelemetryHits(device, current),
            GetTelemetryHits(device, previous),
            GetDeviceMeta(device)
        ]);

        const todayTotal = sumCounts(currentHits);
        const yesterdayTotal = sumCounts(previousHits);

        const todayMap = groupHitsByHour(currentHits);
        const yesterdayMap = groupHitsByHour(previousHits);

        const hourStrings = uniqueSortedHours(currentHits);

        const data = hourStrings.map(hourString => {
            const hour = new Date(hourString).getHours();
            return {
                hour: hourString,
                todayCount: todayMap[hour] || [],
                yesterdayCount: yesterdayMap[hour] || []
            };
        });

        const percentage = calculatePercentageDiff(todayTotal, yesterdayTotal);

        return res.status(200).json({
            data,
            comparison: {
                today: todayTotal,
                yesterday: yesterdayTotal,
                percentage,
            },
            meta: {
                operator: meta.operator,
                machine_name: meta.machine_name,
                product: meta.product
            }
        });
    } catch (error) {
        console.error(`[${getTimestamp()}] Error retrieving data for device ${device}:`, error);
        return res.status(500).json({ error: "Internal server error while fetching widget data." });
    }
}

const getRecords = async (req, res) => {
    const userID = req.user;
    try {
        const data = await Get_Records_Data_Query(userID);
        return res.status(200).json(data);
    } catch (error) {
        console.error(`[${getTimestamp()}] Error retrieving records for user ${userID}:`, error);
        return res.status(500).json({ error: "Internal server error while fetching records." });
    }
}

const displayDailyChart = async (req, res) => {
    const dateString = req.query.date;
    try {
        // Convert "YYYY-MM-DD" into a start timestamp in IST
        const startIST = new Date(`${dateString}T00:00:00+05:30`);

        // Fetch telemetry hits for that day
        const hits = await GetTelemetryHits(deviceID, startIST);

        // Calculate total hits
        const total = sumCounts(hits);

        // Group by hour
        const hourMap = groupHitsByHour(hits);

        // Create unique hour list (sorted)
        const hourStrings = uniqueSortedHours(hits);

        // Build final data
        const data = hourStrings.map(hourString => {
            const hour = new Date(hourString).getHours();
            return {
                hour: hourString,
                count: hourMap[hour] || []   // array of product hits
            };
        });

        console.log({
            date: dateString,
            total,
            data
        });
        return res.status(200).render("daily-chart.ejs");
    } catch (error) {

    }
}

module.exports = { displayHome, GetWidgetData, getRecords, displayDailyChart };