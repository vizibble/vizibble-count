import { getFormattedDate, getToday, getYesterday } from '../utils/utils.js';

function renderChart(chartId, data, date, countKey, stackId, colors) {
    const chart = echarts.init(document.getElementById(chartId));

    const labels = data.map(entry =>
        new Date(entry.hour).toLocaleString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
            timeZone: "Asia/Kolkata"
        })
    );

    const productNames = [...new Set(data.flatMap(entry => entry[countKey].map(p => p.product_name)))];

    const series = productNames.map((productName, index) => ({
        name: productName,
        type: 'bar',
        stack: stackId,
        emphasis: {
            focus: 'series'
        },
        itemStyle: {
            color: colors[index % colors.length]
        },
        data: data.map(entry => {
            const productData = entry[countKey].find(p => p.product_name === productName);
            return productData ? productData.count : 0;
        })
    }));

    chart.setOption({
        title: {
            text: `${getFormattedDate(date)}'s Production`,
            left: "center",
            textStyle: {
                fontSize: 15,
                fontWeight: 'bold',
                color: '#1f2937'
            }
        },
        legend: {
            data: productNames,
            bottom: -10,
            type: 'scroll'
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
                let tooltipHtml = `<div style="font-weight: bold; margin-bottom: 5px;">${params[0].axisValue}</div>`;
                let total = 0;
                params.forEach(param => {
                    if (param.value > 0) {
                        tooltipHtml += `<div><span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:${param.color};"></span>${param.seriesName}: <strong>${param.value}</strong> pieces</div>`;
                        total += param.value;
                    }
                });
                tooltipHtml += `<hr style="margin: 5px 0;"><div>Total: <strong>${total}</strong> pieces</div>`;
                return tooltipHtml;
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
        series: series
    });

    window.addEventListener('resize', () => {
        chart.resize();
    });
}

export function renderBarChart(data) {
    const today = getToday();
    const colors = [
        '#3b82f6', '#10b981', '#f97316', '#8b5cf6', '#ec4899',
        '#ef4444', '#f59e0b', '#84cc16', '#06b6d4', '#d946ef',
        '#14b8a6', '#6366f1', '#f43f5e', '#22c55e', '#a855f7',
        '#0ea5e9', '#eab308', '#78716c', '#8c2727', '#166534'
    ];
    renderChart('hitsChart', data, today, 'todayCount', 'todayStack', colors);
}

export function renderYesterdayChart(data) {
    const yesterday = getYesterday();
    const colors = [
        '#6b7280', '#9ca3af', '#4b5563', '#d1d5db', '#e5e7eb',
        '#f3f4f6', '#f9fafb', '#374151', '#1f2937', '#111827',
        '#71717a', '#a1a1aa', '#52525b', '#d4d4d8', '#e4e4e7',
        '#fafafa', '#3f3f46', '#27272a', '#18181b', '#78716c'
    ];
    renderChart('yesterdayChart', data, yesterday, 'yesterdayCount', 'yesterdayStack', colors);
}