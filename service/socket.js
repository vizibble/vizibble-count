const socket = require("socket.io");
const { getTimestamp } = require('../utils/time');

let io;

function init(server) {
    io = new socket.Server(server, {
        cors: {
            origin: "*", // Adjust this for production for security
        }
    });

    io.on("connection", (socket) => {
        console.log(`[${getTimestamp()}] A user connected with socket ID: ${socket.id}`);

        socket.on("disconnect", () => {
            console.log(`[${getTimestamp()}] User disconnected with socket ID: ${socket.id}`);
        });
    });

    return io;
}

function emitToFrontend(event, data) {
    if (io) {
        io.emit(event, data);
    } else {
        console.warn(`[${getTimestamp()}] Socket.IO not initialized. Cannot emit event '${event}'.`);
    }
}

module.exports = {
    init,
    emitToFrontend
};