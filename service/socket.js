const socket = require("socket.io");
const cookie = require("cookie");
const { getTimestamp } = require('../utils/time');
const { JWTVerification } = require('./userAutehntication');
const { Device_Permission_Query } = require('../models/device');

let io;

function init(server) {
    io = new socket.Server(server, {
        cors: {
            origin: "*",   //TODO CHANGE THIS IN PRODUCTION
            credentials: true
        }
    });

    io.use((socket, next) => {
        try {
            const cookies = cookie.parse(socket.handshake.headers.cookie || "");
            const token = cookies.token;
            if (!token) return next(new Error("AUTH_ERROR"));

            const user = JWTVerification(token);
            if (!user || !user.id) return next(new Error("AUTH_ERROR"));
            socket.user = user;

            next();
        } catch (err) {
            next(new Error("AUTH_ERROR"));
        }
    });

    io.on("connection", (socket) => {
        // Handler for when a client wants to subscribe to a device's updates
        socket.on('subscribe', async (connectionID) => {
            try {
                const permission = await Device_Permission_Query(socket.user.id, connectionID);
                if (permission) {
                    socket.join(`device-${connectionID}`);
                } else {
                    console.warn(`[${getTimestamp()}] Unauthorized subscription attempt by user ${socket.user.id} for device ${connectionID}`);
                }
            } catch (error) {
                console.error(`[${getTimestamp()}] Subscription error:`, error);
            }
        });

        socket.on("disconnect", () => {
            console.log(`[${getTimestamp()}] User ${socket.user.id} disconnected`);
        });
    });

    return io;
}

// Emit data to a specific room
function emitToFrontend(room, event, data) {
    if (!io) {
        console.warn(`Socket.IO not initialized. Cannot emit '${event}'.`);
        return;
    }
    io.to(room).emit(event, data);
}

module.exports = { init, emitToFrontend };
