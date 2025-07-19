let active_connection = null;
let shift_count = null;

function showModal(heading, text) {
    const modal = document.querySelector(".modal");
    modal.classList.remove("hidden");

    setTimeout(() => {
        modal.classList.remove("opacity-0", "translate-y-4");
        modal.classList.add("opacity-100", "translate-y-0");
    }, 10);

    modal.querySelector(".status_alert_heading").innerText = heading;
    modal.querySelector(".status_text").innerText = text;

    setTimeout(() => {
        modal.classList.remove("opacity-100", "translate-y-0");
        modal.classList.add("opacity-0", "translate-y-4");
        setTimeout(() => modal.classList.add("hidden"), 300);
    }, 3000);
}

function getCurrentShiftIST() {
    const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
    const hour = now.getHours();

    if (hour >= 6 && hour < 14) return "Morning (6 AM - 2 PM)";
    if (hour >= 14 && hour < 22) return "Afternoon (2 PM - 10 PM)";
    return "Night (10 PM - 6 AM)";
}

function renderLineChart(data) {
    const chart = echarts.init(document.getElementById("lineChart"));

    const labels = data.map(entry =>
        new Date(entry.hour).toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
            timeZone: "Asia/Kolkata"
        })
    );

    const todayHits = data.map(entry => entry.todayHits);
    const yesterdayHits = data.map(entry => entry.yesterdayHits);

    chart.setOption({
        title: {
            text: "Today vs Yesterday",
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
            data: ["Today", "Yesterday"],
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
                name: 'Today',
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
                name: 'Yesterday',
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

function renderBarChart(data) {
    const chart = echarts.init(document.getElementById("hitsChart"));
    const labels = data.map(entry =>
        new Date(entry.hour).toLocaleString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
            timeZone: "Asia/Kolkata"
        })
    );
    const hits = data.map(entry => entry.count);

    chart.setOption({
        title: {
            text: "Today's Production",
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

document.getElementById("select").addEventListener("click", async () => {
    const selectedRadio = document.querySelector('input[name="device"]:checked');
    active_connection = selectedRadio.id;
    if (!selectedRadio) {
        showModal("No device selected!", "Please choose a device before fetching data.");
        return;
    }

    const ID = selectedRadio.value;
    document.getElementById("select").classList.add("hidden");
    document.getElementById("loading").classList.remove("hidden");

    try {
        const res = await fetch(`/widgets/data?device=${ID}`);
        const response = await res.json();

        if (!res.ok || !response || !Array.isArray(response.data)) {
            throw new Error("Invalid response");
        }

        const { data, comparison, meta } = response;

        // Update Meta Info
        document.getElementById("metaShift").innerText = getCurrentShiftIST();
        document.getElementById("metaMachine").innerText = meta.machine_name || "–";
        document.getElementById("metaOperator").innerText = meta.operator || "–";
        document.getElementById("metaProduct").innerText = meta.product || "–";

        // Update Count Info
        $('#todayHitCount').sevenSeg({ value: comparison.today, digits: String(comparison.today).length, decimalPoint: false });
        document.getElementById("todayCount").innerText = comparison.today || 0;
        document.getElementById("yesterdayCount").innerText = comparison.yesterday || 0;
        document.getElementById("percentageDiff").innerText = `${Math.abs(comparison.percentage).toFixed(1)}%`;

        const icon = document.getElementById("trendIcon");
        if (comparison.percentage > 0) {
            icon.innerText = "↑";
            icon.classList.add("text-green-600");
            icon.classList.remove("text-red-600");
        } else if (comparison.percentage < 0) {
            icon.innerText = "↓";
            icon.classList.add("text-red-600");
            icon.classList.remove("text-green-600");
        } else {
            icon.innerText = "→";
            icon.classList.remove("text-green-600", "text-red-600");
        }

        // Update Shift Hit Count
        const currentHour = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })).getHours();
        const shiftData = data.filter(entry => {
            const hourIST = new Date(entry.hour).getHours();
            return (
                (currentHour >= 6 && currentHour < 14 && hourIST >= 6 && hourIST < 14) ||
                (currentHour >= 14 && currentHour < 22 && hourIST >= 14 && hourIST < 22) ||
                ((currentHour >= 22 || currentHour < 6) && (hourIST >= 22 || hourIST < 6))
            );
        });
        const shiftCount = Number(shiftData.reduce((sum, e) => sum + Number(e.count), 0));
        $('#shiftHitCount').sevenSeg({ value: shiftCount, digits: String(shiftCount).length, decimalPoint: false });
        shift_count = shiftCount;

        document.getElementById("lastUpdated").innerText = `Last updated: ${new Date().toLocaleTimeString()}`;
        document.getElementById("widgets").classList.remove("hidden");

        renderBarChart(data);
        // renderLineChart(data);
    } catch (err) {
        console.error("Error fetching widget data:", err.message);
        showModal("Fetch Error", err.message || "Something went wrong.");
    } finally {
        document.getElementById("loading").classList.add("hidden");
        document.getElementById("select").classList.remove("hidden");
    }
});

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

        shift_count += 1;
        $('#shiftHitCount').sevenSeg({ value: shift_count, digits: String(shift_count).length, decimalPoint: false });

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
