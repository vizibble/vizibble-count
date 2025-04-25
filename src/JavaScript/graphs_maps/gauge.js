/* global echarts */
let gauge = null;
const resize_gauge = () => gauge.resize()

function create_gauge({ fuel_level }, selectedTanker) {
    // Destroy the previous gauge if it exists
    if (gauge) {
        gauge.dispose();
        window.removeEventListener('resize', resize_gauge);
    }
    gauge = echarts.init(document.getElementById('gauge'));

    const option = {
        tooltip: {
            formatter: '{a} <br/>{b} : {c}L'
        },
        series: [
            {
                name: selectedTanker,
                type: 'gauge',
                min: 0,
                max: 10000,
                progress: {
                    show: true
                },
                detail: {
                    valueAnimation: true,
                    formatter: '{value} L'
                },
                data: [
                    {
                        value: volume(fuel_level).toFixed(2),
                        name: 'Volume'
                    }
                ]
            }
        ]
    };
    window.addEventListener('resize', resize_gauge);
    gauge.setOption(option);
}

const update_gauge = (fuel_level) => {
    gauge.setOption({
        series: [
            {
                data: [
                    {
                        value: volume(fuel_level).toFixed(2),
                        name: 'Volume'
                    }
                ]
            }
        ]
    });
}

function volume(fuel_level) {
    const volume = -0.000005744628532 * Math.pow(fuel_level, 3) + 0.009927196796148 * Math.pow(fuel_level, 2) + 4.150072958151474 * Math.pow(fuel_level, 1) + -162.312544323069432
    if (volume < 0) return 0;
    return volume;
}
module.exports = { create_gauge, update_gauge }