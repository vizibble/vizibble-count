import {
  active_connection, shift_count, updateShiftCount,
} from '../api/api.js';
import { updateStatus } from '../utils/utils.js';

document.addEventListener('DOMContentLoaded', () => {
    const socket = io({
        withCredentials: true
    });

    // Subscribe to updates when the page loads
    socket.on('connect', () => {
        if (active_connection)
            socket.emit('subscribe', active_connection);
    });

    // subscribe to the new device's room.
    document.addEventListener('selectedDeviceChanged', (event) => {
        const newConnectionID = event.detail.connectionID;
        if (newConnectionID)
            socket.emit('subscribe', newConnectionID);
    });

    socket.on('update', (data) => {
        if (active_connection === data.connectionID)
            updateWidgets(data);
    });

    socket.on('status', (data) => {
        if (active_connection == data.connectionID)
            updateStatus('LOW');
    })

    function updateWidgets(data) {
        // Update total count
        const todayCountEl = document.getElementById('todayCount');
        const newTotalCount = parseInt(todayCountEl.innerText) + 1;
        todayCountEl.innerText = newTotalCount;
        $('#todayHitCount').sevenSeg({ value: newTotalCount, digits: String(newTotalCount).length, decimalPoint: false });

        const newShiftCount = shift_count + 1;
        updateShiftCount(newShiftCount);
        $('#shiftHitCount').sevenSeg({ value: newShiftCount, digits: String(newShiftCount).length, decimalPoint: false });

        updateStatus('HIGH')

        // Update chart
        const hitsChart = echarts.getInstanceByDom(document.getElementById('hitsChart'));
        if (hitsChart) {
            const options = hitsChart.getOption();
            const rawDate = new Date(data.timestamp);
            const istDate = new Date(rawDate.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
            const productName = data.product;

            let hours = istDate.getHours();
            const suffix = hours >= 12 ? 'pm' : 'am';
            hours = hours % 12;
            hours = hours === 0 ? 12 : hours;
            const hourLabel = `${String(hours).padStart(2, '0')}:00 ${suffix}`;

            const labelIndex = options.xAxis[0].data.indexOf(hourLabel);
            let seriesIndex = options.series.findIndex(s => s.name === productName);

            if (seriesIndex === -1) {
                options.series.push({
                    name: productName,
                    type: 'bar',
                    data: Array(options.xAxis[0].data.length).fill(0)
                });
                seriesIndex = options.series.length - 1;
            }

            if (labelIndex > -1) {
                options.series[seriesIndex].data[labelIndex] =
                    (options.series[seriesIndex].data[labelIndex] || 0) + 1;
            } else {
                options.xAxis[0].data.push(hourLabel);
                options.series.forEach((s, i) => {
                    s.data.push(i === seriesIndex ? 1 : 0);
                });
            }

            hitsChart.setOption(options);
        }

        // Update Last Updated Time
        document.getElementById('lastUpdated').innerText = `Last updated: ${new Date(data.timestamp).toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata" })}`;
    }

    socket.on('disconnect', () => {
        console.log('Disconnected from server.');
    });

    socket.on('connect_error', (err) => {
        console.error(`Connection Error: ${err.message}`);
        // Handle auth error
        if (err.message.includes("AUTH_ERROR")) {
            window.location.href = "/";
        }
    });
});