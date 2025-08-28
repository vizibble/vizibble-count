const { Get_Device_Data_Query, Get_All_Ids_Query, Get_Records_Data_Query } = require("../models/user.js");
require("dotenv").config()

const displayHome = async (req, res) => {
    const userID = req.user
    try {
        const devices = await Get_All_Ids_Query(userID);
        return res.status(200).render("index.ejs", { names: devices });
    }
    catch (error) {
        console.error(`[${new Date().toLocaleString("en-GB")}] Error fetching devices: ${error.message}`);
        return res.status(500).json({ error: "Internal server error while fetching devices." });
    }
};

const GetWidgetData = async (req, res) => {
    const { device } = req.query;
    const userID = req.user;
    try {
        const rows = await Get_Device_Data_Query(device);
        return res.status(200).json(rows);
    } catch (error) {
        console.error(`[${new Date().toLocaleString("en-GB")}] Error retrieving data for device ${device}: ${error.message}`);
        return res.status(500).json({ error: error.message });
    }
}

const getRecords = async (req, res) => {
    const userID = req.user;
    try {
        const data = await Get_Records_Data_Query(userID);
        return res.status(200).json(data);
    } catch (error) {
        console.error(`[${new Date().toLocaleString("en-GB")}] Error retrieving records for device ${device}: ${error.message}`);
        return res.status(500).json({ error: error.message });
    }
}

module.exports = { displayHome, GetWidgetData, getRecords };