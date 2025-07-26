import { active_connection, shift_count, updateShiftCount } from '../api/api.js';

document.addEventListener('DOMContentLoaded', () => {
    const socket = io();

    socket.on('connect', () => {
        console.log('Connected to server via WebSocket.');
    });

    socket.on('update', (data) => {
        if (active_connection === data.connectionID) {
            updateWidgets(data);
        }
    });

    function updateWidgets(data) {
        // Update total count
        const todayCountEl = document.getElementById('todayCount');
        const newTotalCount = parseInt(todayCountEl.innerText) + 1;
        todayCountEl.innerText = newTotalCount;
        $('#todayHitCount').sevenSeg({ value: newTotalCount, digits: String(newTotalCount).length, decimalPoint: false });

        const newShiftCount = shift_count + 1;
        updateShiftCount(newShiftCount);
        $('#shiftHitCount').sevenSeg({ value: newShiftCount, digits: String(newShiftCount).length, decimalPoint: false });

        // Update chart
        const chart = echarts.getInstanceByDom(document.getElementById('hitsChart'));
        if (chart) {
            const options = chart.getOption();
            const rawDate = new Date(data.timestamp);
            const istDate = new Date(rawDate.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));

            let hours = istDate.getHours();
            const suffix = hours >= 12 ? 'pm' : 'am';
            hours = hours % 12;
            hours = hours === 0 ? 12 : hours;
            const hourLabel = `${String(hours).padStart(2, '0')}:00 ${suffix}`;

            const labelIndex = options.xAxis[0].data.indexOf(hourLabel);
            if (labelIndex > -1) {
                const currentCount = parseInt(options.series[0].data[labelIndex])
                options.series[0].data[labelIndex] = currentCount + 1;
            } else {
                options.xAxis[0].data.push(hourLabel);
                options.series[0].data.push(data.deviceCount);
            }
            chart.setOption(options);
        }

        // Update Last Updated Time
        document.getElementById('lastUpdated').innerText = `Last updated: ${new Date(data.timestamp).toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata" })}`;
    }

    socket.on('disconnect', () => {
        console.log('Disconnected from server.');
    });
});
