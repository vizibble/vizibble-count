import { getFormattedDate, getToday, getYesterday } from '../utils/utils.js';

export function renderBarChart(data) {
    const chart = echarts.init(document.getElementById("hitsChart"));
    const labels = data.map(entry =>
        new Date(entry.hour).toLocaleString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
            timeZone: "Asia/Kolkata"
        })
    );
    const hits = data.map(entry => entry.todayCount);

    const today = getToday();

    chart.setOption({
        title: {
            text: `${getFormattedDate(today)}'s Production`,
            left: "center",
            textStyle: {
                fontSize: 15,
                fontWeight: 'bold',
                color: '#1f2937'
            }
        },
        tooltip: {
            trigger: "axis",
            axisPointer: { type: "shadow" },
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderColor: '#e5e7eb',
            borderWidth: 1,
            textStyle: {
                color: '#374151'
            },
            formatter: function (params) {
                const param = params[0];
                return `<div style="font-weight: bold; margin-bottom: 5px;">${param.axisValue}</div>
                        <div>Production: <strong>${param.value}</strong> pieces</div>`;
            }
        },
        grid: {
            left: "3%",
            right: "4%",
            bottom: "12%",
            top: "15%",
            containLabel: true
        },
        xAxis: {
            type: "category",
            data: labels,
            axisLabel: {
                rotate: 45,
                fontSize: 12,
                color: '#6b7280'
            },
            axisLine: {
                lineStyle: {
                    color: '#d1d5db'
                }
            }
        },
        yAxis: {
            type: "value",
            name: "Pieces",
            nameTextStyle: {
                fontSize: 14,
                fontWeight: 'bold',
                color: '#374151'
            },
            axisLabel: {
                fontSize: 12,
                color: '#6b7280'
            },
            axisLine: {
                lineStyle: {
                    color: '#d1d5db'
                }
            },
            splitLine: {
                lineStyle: {
                    color: '#f3f4f6'
                }
            }
        },
        dataZoom: [
            {
                type: 'slider',
                show: true,
                start: 0,
                end: window.innerWidth < 480 ? 30 : 100
            }
        ],
        series: [
            {
                name: "Production",
                type: "bar",
                data: hits,
                itemStyle: {
                    color: {
                        type: 'linear',
                        x: 0,
                        y: 0,
                        x2: 0,
                        y2: 1,
                        colorStops: [{
                            offset: 0, color: '#3b82f6'
                        }, {
                            offset: 1, color: '#1e40af'
                        }]
                    },
                    borderRadius: [10, 10, 0, 0],
                    shadowColor: 'rgba(0, 0, 0, 0.1)',
                    shadowBlur: 10
                },
                barWidth: "80%",
                emphasis: {
                    itemStyle: {
                        color: {
                            type: 'linear',
                            x: 0,
                            y: 0,
                            x2: 0,
                            y2: 1,
                            colorStops: [{
                                offset: 0, color: '#60a5fa'
                            }, {
                                offset: 1, color: '#3b82f6'
                            }]
                        }
                    }
                }
            }
        ]
    });

    // Make chart responsive
    window.addEventListener('resize', () => {
        chart.resize();
    });
}

export function renderYesterdayChart(data) {
    const chart = echarts.init(document.getElementById("yesterdayChart"));
    const labels = data.map(entry =>
        new Date(entry.hour).toLocaleString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
            timeZone: "Asia/Kolkata"
        })
    );
    const hits = data.map(entry => entry.yesterdayCount);

    const yesterday = getYesterday();

    chart.setOption({
        title: {
            text: `${getFormattedDate(yesterday)}'s Production`,
            left: "center",
            textStyle: {
                fontSize: 15,
                fontWeight: 'bold',
                color: '#1f2937'
            }
        },
        tooltip: {
            trigger: "axis",
            axisPointer: { type: "shadow" },
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderColor: '#e5e7eb',
            borderWidth: 1,
            textStyle: {
                color: '#374151'
            },
            formatter: function (params) {
                const param = params[0];
                return `<div style="font-weight: bold; margin-bottom: 5px;">${param.axisValue}</div>
                        <div>Production: <strong>${param.value}</strong> pieces</div>`;
            }
        },
        grid: {
            left: "3%",
            right: "4%",
            bottom: "12%",
            top: "15%",
            containLabel: true
        },
        xAxis: {
            type: "category",
            data: labels,
            axisLabel: {
                rotate: 45,
                fontSize: 12,
                color: '#6b7280'
            },
            axisLine: {
                lineStyle: {
                    color: '#d1d5db'
                }
            }
        },
        yAxis: {
            type: "value",
            name: "Pieces",
            nameTextStyle: {
                fontSize: 14,
                fontWeight: 'bold',
                color: '#374151'
            },
            axisLabel: {
                fontSize: 12,
                color: '#6b7280'
            },
            axisLine: {
                lineStyle: {
                    color: '#d1d5db'
                }
            },
            splitLine: {
                lineStyle: {
                    color: '#f3f4f6'
                }
            }
        },
        dataZoom: [
            {
                type: 'slider',
                show: true,
                start: 0,
                end: window.innerWidth < 480 ? 30 : 100
            }
        ],
        series: [
            {
                name: "Production",
                type: "bar",
                data: hits,
                itemStyle: {
                    color: {
                        type: 'linear',
                        x: 0,
                        y: 0,
                        x2: 0,
                        y2: 1,
                        colorStops: [
                            { offset: 0, color: '#9ca3af' }, // light gray
                            { offset: 1, color: '#4b5563' }  // dark gray
                        ]
                    },
                    borderRadius: [10, 10, 0, 0],
                    shadowColor: 'rgba(0, 0, 0, 0.1)',
                    shadowBlur: 10
                },
                barWidth: "80%",
                emphasis: {
                    itemStyle: {
                        color: {
                            type: 'linear',
                            x: 0,
                            y: 0,
                            x2: 0,
                            y2: 1,
                            colorStops: [
                                { offset: 0, color: '#d1d5db' }, // lighter gray
                                { offset: 1, color: '#6b7280' }  // medium gray
                            ]
                        }
                    }
                }
            }
        ]
    });

    // Make chart responsive
    window.addEventListener('resize', () => {
        chart.resize();
    });
}