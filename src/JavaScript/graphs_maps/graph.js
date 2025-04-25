2/* global echarts */
let chart = null;
const visibleData = [];

function resize_graph() {
    chart.resize();
}

//Function to create a graph
function create_graph(selectedTanker) {
    // Destroy the previous chart if it exists
    if (chart) {
        chart.dispose();
        window.removeEventListener('resize', resize_graph);
    }
    chart = echarts.init(document.getElementById('chart-canvas'));

    const option = {
        legend: {
            orient: 'horizontal',
            right: 'center',
            top: 20,
        },
        title: {
            text: 'Tanker Level',
            left: 'center',
            top: 'top',
            textStyle: {
                color: 'blue',
                fontStyle: 'italic',
                fontWeight: 'bold',
                fontFamily: 'Arial',
                fontSize: 16
            },
        },
        tooltip: {
            trigger: 'axis'
        },
        grid: {
            show: true
        },
        xAxis: {
            type: 'time',
            name: 'Time',
            splitLine: {
                show: true
            }
        },
        yAxis: {
            type: 'value',
            axisLabel: {
                formatter: '{value} L',
                align: 'right'
            },
        },
        series: [
            {
                name: selectedTanker,
                type: 'line',
                data: visibleData,
                large: true,
                showSymbol: false,
                smooth: true,
            },
        ],
        dataZoom: [
            { type: 'slider' },
            { type: 'inside' }
        ]
    };
    window.addEventListener('resize', resize_graph);
    chart.setOption(option);
}

// Function to update Graph with new data
function update_graph(fuel) {
    const now = new Date();
    // visibleData.shift(); // Remove the oldest data point
    visibleData.push([now.getTime(), volume(fuel).toFixed(2)]);

    // Update the chart with new data
    chart.setOption({ series: [{ data: visibleData }] }, false);
}

// Function to update Graph with new tanker data
function update_graph_data(values, selectedTanker) {
    // Clear previous data
    visibleData.length = 0;

    // Populate visible data with new values
    values.forEach(row => {
        const seconds = new Date(row.timestamp).getTime();
        const date = new Date(seconds);
        visibleData.unshift([date, volume(row.fuel_level).toFixed(2)]);
    });
    create_graph(selectedTanker);
}

function volume(fuel_level) {
    const volume = -0.000005744628532 * Math.pow(fuel_level, 3) + 0.009927196796148 * Math.pow(fuel_level, 2) + 4.150072958151474 * Math.pow(fuel_level, 1) + -162.312544323069432
    if (volume < 0) return 0;
    return volume;
}

module.exports = { create_graph, update_graph, update_graph_data };