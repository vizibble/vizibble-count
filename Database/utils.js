// This function takes a date object and returns a string like:
// "2025-01-05 06:00:00"
function formatIST6AM(date) {
    // Get year like 2025
    const year = date.getFullYear();
    // Get month (0-11), so +1. Pad single-digit months like 1 → 01.
    let month = date.getMonth() + 1;
    if (month < 10) month = "0" + month;
    // Get day (1-31). Pad single-digit days like 3 → 03.
    let day = date.getDate();
    if (day < 10) day = "0" + day;
    // Return final string with 6 AM fixed
    return year + "-" + month + "-" + day + " 06:00:00";
}

function sumCounts(rows) {
    let total = 0;
    rows.forEach(row => {
        total += Number(row.count);
    })
    return total;
}

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

    const today = new Date(`${year}-${month}-${day}T00:00:00`);
    let today6AM, yesterday6AM;

    if (hour >= 6) {
        today6AM = new Date(today);
        yesterday6AM = new Date(today);
        yesterday6AM.setDate(yesterday6AM.getDate() - 1);
    } else {
        today6AM = new Date(today);
        today6AM.setDate(today6AM.getDate() - 1);
        yesterday6AM = new Date(today6AM);
        yesterday6AM.setDate(yesterday6AM.getDate() - 1);
    }

    return {
        current: formatIST6AM(today6AM),
        previous: formatIST6AM(yesterday6AM)
    };
}

function groupHitsByHour(rows) {
    // Empty object to store groups
    const result = {};
    rows.forEach(row => {
        // Convert timestamp string to Date()
        const dateObj = new Date(row.hour);
        // Extract hour number (0-23)
        const hour = dateObj.getHours();
        // Skip if count is 0
        if (row.count > 0) {
            // If hour key does not exist → create an empty array
            if (!result[hour]) result[hour] = [];
            // Push details
            result[hour].push({
                product_id: row.product_id,
                product_name: row.product_name,
                count: Number(row.count)
            });
        }
    })
    return result;
}


const uniqueSortedHours = (hits) =>
    [...new Set(hits.map(h => h.hour))].sort();

const calculatePercentageDiff = (today, yesterday) => {
    if (yesterday > 0)
        return Number(((today - yesterday) / yesterday * 100).toFixed(2));

    return today > 0 ? 100 : 0;
};

module.exports = {
    getISTDates,
    sumCounts,
    formatIST6AM,
    uniqueSortedHours,
    groupHitsByHour,
    calculatePercentageDiff
};