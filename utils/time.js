const getISTTime = () => new Date().toLocaleString("en-GB", { timeZone: "Asia/Kolkata" });
const getTimestamp = () => new Date().toISOString();

module.exports = { getISTTime, getTimestamp };
