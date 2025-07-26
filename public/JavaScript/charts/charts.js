import { getFormattedDate, getToday, getYesterday } from '../utils/utils.js';

export function renderLineChart(data) {
    const chart = echarts.init(document.getElementById("lineChart"));

    const labels = data.map(entry =>
        new Date(entry.hour).toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
            timeZone: "Asia/Kolkata"
        })
    );

    const todayHits = data.map(entry => entry.todayCount)
        .reduce((acc, val, i) => [...acc, (acc[i - 1] || 0) + val], []);

    const yesterdayHits = data.map(entry => entry.yesterdayCount)
        .reduce((acc, val, i) => [...acc, (acc[i - 1] || 0) + val], []);

    const today = getToday();
    const yesterday = getYesterday();

    chart.setOption({
        title: {
            text: `${getFormattedDate(today)} vs ${getFormattedDate(yesterday)}`,
            left: "center",
            textStyle: {
                fontSize: 18,
                fontWeight: 'bold',
                color: '#1f2937'
            }
        },
        tooltip: {
            trigger: "axis",
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderColor: '#e5e7eb',
            borderWidth: 1,
            textStyle: {
                color: '#374151'
            },
            formatter: function (params) {
                let tooltip = `<div style="font-weight: bold; margin-bottom: 5px;">${params[0].axisValue}</div>`;
                params.forEach(param => {
                    tooltip += `<div style="margin: 2px 0;">
                        <span style="display: inline-block; width: 10px; height: 10px; background-color: ${param.color}; border-radius: 50%; margin-right: 5px;"></span>
                        ${param.seriesName}: <strong>${param.value}</strong> pieces
                    </div>`;
                });
                return tooltip;
            }
        },
        legend: {
            data: [getFormattedDate(today), getFormattedDate(yesterday)],
            top: 40,
            textStyle: {
                fontSize: 14,
                fontWeight: 'bold'
            }
        },
        grid: {
            left: "3%",
            right: "4%",
            bottom: "12%",
            top: "20%",
            containLabel: true
        },
        xAxis: {
            type: "category",
            data: labels,
            axisLabel: {
                interval: 0,
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
            type: 'value',
            name: 'Pieces',
            nameTextStyle: {
                fontSize: 16,
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
        series: [
            {
                name: getFormattedDate(today),
                type: 'line',
                data: todayHits,
                smooth: true,
                symbol: 'circle',
                symbolSize: 8,
                itemStyle: {
                    color: '#3b82f6',
                    borderWidth: 2,
                    borderColor: '#ffffff'
                },
                lineStyle: {
                    width: 4,
                    color: '#3b82f6'
                },
                areaStyle: {
                    color: {
                        type: 'linear',
                        x: 0,
                        y: 0,
                        x2: 0,
                        y2: 1,
                        colorStops: [{
                            offset: 0, color: 'rgba(59, 130, 246, 0.3)'
                        }, {
                            offset: 1, color: 'rgba(59, 130, 246, 0.1)'
                        }]
                    }
                }
            },
            {
                name: getFormattedDate(yesterday),
                type: 'line',
                data: yesterdayHits,
                smooth: true,
                symbol: 'circle',
                symbolSize: 6,
                itemStyle: {
                    color: '#9ca3af',
                    borderWidth: 2,
                    borderColor: '#ffffff'
                },
                lineStyle: {
                    type: 'dashed',
                    width: 3,
                    color: '#9ca3af'
                }
            }
        ]
    });
    // Make chart responsive
    window.addEventListener('resize', () => {
        chart.resize();
    });

}

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
                fontSize: 18,
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