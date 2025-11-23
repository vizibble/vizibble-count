
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
const cookieParser = require("cookie-parser");
app.use(cookieParser());

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
const { init: initSocket } = require("./service/socket.js");
initSocket(server);

//Different Routes
const device = require("./routes/device.js")
app.use("/api", device)

const user = require("./routes/user.js")

const { JWTMiddleware } = require('./middleware/checkAuth.js');
app.use("/user", (req, res, next) => {
    if (process.env.NODE_ENV === 'production') {
        const manifest = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'dist/.vite/manifest.json'), 'utf8'));
        res.locals.manifest = manifest;
    }
    next();
}, JWTMiddleware, user);

const auth = require("./routes/auth.js");
app.use("/", auth)

//Starting the server
const PORT = process.env.PORT || 8080
server.listen(PORT, () => console.log(`Server Started at ${PORT}`))