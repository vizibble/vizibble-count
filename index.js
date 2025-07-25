
//Express Setup
const express = require('express');
const app = express();
const fs = require('fs');

//Using HTTP for socket.io
const http = require("http")
const server = http.createServer(app)

//.env for sensitive information
require("dotenv").config();

//Express Middlewares for recieving and parsing json and form data
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Setting Up Templating Engine
const path = require("path")
app.set("view engine", "ejs")
app.set("views", path.resolve("./views"))

if (process.env.NODE_ENV == 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
} else {
    app.use(express.static(path.join(__dirname, 'public')));
}

//Socket.io
const socket = require("socket.io")
const io = new socket.Server(server)
io.on("connection", (socket) => { app.set("socket", socket) })

//Different Routes
const device = require("./routes/device.js")
app.use("/api", device)
const user = require("./routes/user.js")

app.use("/", (req, res, next) => {
    if (process.env.NODE_ENV === 'production') {
        const manifest = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'dist/.vite/manifest.json'), 'utf8'));
        res.locals.manifest = manifest;
    }
    user(req, res, next);
});


//Connecting the Database
const redis = require("./service/redis.js");
redis.on('connect', () => { console.log('Connected to Redis') });
redis.on('error', (err) => { console.error('Redis pool encountered an error:', err) });

//Starting the server
const PORT = process.env.PORT || 8080
server.listen(PORT, () => console.log(`Server Started at ${PORT}`))
