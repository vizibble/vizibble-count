const { Get_Historical_Data, Get_All_Ids_Query } = require("../Database/user.js");
require("dotenv").config()

const displayHome = async (req, res) => {
    try {
        const devices = await Get_All_Ids_Query();
        return res.status(200).render("index.ejs", { names: devices });
    }
    catch (error) {
        console.error(`[${new Date().toLocaleString("en-GB")}] Error fetching devices: ${error.message}`);
        return res.status(500).json({ error: "Internal server error while fetching devices." });
    }
};

const GetWidgetData = async (req, res) => {
    const { device } = req.query;
    try {
        const rows = await Get_Historical_Data(device);
        console.log(rows);
        return res.status(200).json(rows);
    } catch (error) {
        console.error(`[${new Date().toLocaleString("en-GB")}] Error retrieving data for device ${device}: ${error.message}`);
        return res.status(500).json({ error: error.message });
    }
}

module.exports = { displayHome, GetWidgetData };