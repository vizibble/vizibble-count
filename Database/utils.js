const formatIST6AM = (dateObj) => {
    const y = dateObj.getFullYear();
    const m = String(dateObj.getMonth() + 1).padStart(2, '0');
    const d = String(dateObj.getDate()).padStart(2, '0');
    return `${y}-${m}-${d} 06:00:00`;
};

const sumCounts = (hits) =>
    hits.reduce((sum, row) => sum + Number(row.count), 0);

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

const groupHitsByHour = (hits) => {
    const map = {};
    hits.forEach(hit => {
        const hour = new Date(hit.hour).getHours();
        if (hit.count > 0) {
            if (!map[hour]) map[hour] = [];
            map[hour].push({
                product_id: hit.product_id,
                product_name: hit.product_name,
                count: Number(hit.count),
            });
        }
    });
    return map;
};

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