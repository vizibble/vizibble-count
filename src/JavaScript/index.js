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
            left: "center"
        },
        tooltip: {
            trigger: "axis"
        },
        legend: {
            data: ["Today", "Yesterday"],
            top: 30
        },
        grid: {
            left: "3%",
            right: "4%",
            bottom: "8%",
            containLabel: true
        },
        xAxis: {
            type: "category",
            data: labels,
            axisLabel: {
                interval: 0,
                rotate: 45
            }
        },
        yAxis: {
            type: 'value',
            name: 'Total Pieces'
        },
        series: [
            {
                name: 'Today',
                type: 'line',
                data: todayHits,
                smooth: true,
                symbol: 'circle',
                symbolSize: 6,
                itemStyle: { color: '#4CAF50' },
                lineStyle: { width: 3 }
            },
            {
                name: 'Yesterday',
                type: 'line',
                data: yesterdayHits,
                smooth: true,
                symbol: 'circle',
                symbolSize: 6,
                itemStyle: { color: '#999' },
                lineStyle: { type: 'dashed', width: 2 }
            }
        ]
    });
}

function renderBarChart(data) {
    const chart = echarts.init(document.getElementById("hitsChart"));
    const labels = data.map(entry =>
        new Date(entry.hour).toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
            timeZone: "Asia/Kolkata"
        })
    );
    const hits = data.map(entry => entry.todayHits);

    chart.setOption({
        title: {
            text: "Today's Hourly Hits",
            left: "center"
        },
        tooltip: {
            trigger: "axis",
            axisPointer: { type: "shadow" }
        },
        grid: {
            left: "3%",
            right: "4%",
            bottom: "8%",
            containLabel: true
        },
        xAxis: {
            type: "category",
            data: labels,
            axisLabel: { rotate: 45 }
        },
        yAxis: {
            type: "value",
            name: "Hits"
        },
        series: [
            {
                name: "Hits",
                type: "bar",
                data: hits,
                itemStyle: {
                    color: "#4CAF50",
                    borderRadius: [4, 4, 0, 0]
                },
                barWidth: "60%"
            }
        ]
    });
}

document.getElementById("select").addEventListener("click", async () => {
    const selectedRadio = document.querySelector('input[name="device"]:checked');
    if (!selectedRadio) {
        showModal("No device selected!", "Please choose a device before fetching data.");
        return;
    }

    const connectionID = selectedRadio.value;
    document.getElementById("select").classList.add("hidden");
    document.getElementById("loading").classList.remove("hidden");

    try {
        const res = await fetch(`/widgets/data?device=${connectionID}`);
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
        document.getElementById("todayHitCount").innerText = comparison.today || 0;
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

        const shiftCount = shiftData.reduce((sum, e) => sum + e.todayHits, 0);
        document.getElementById("shiftHitCount").innerText = shiftCount;

        document.getElementById("lastUpdated").innerText = `Last updated: ${new Date().toLocaleTimeString()}`;
        document.getElementById("widgets").classList.remove("hidden");

        renderBarChart(data);
        renderLineChart(data);
    } catch (err) {
        console.error("Error fetching widget data:", err.message);
        showModal("Fetch Error", err.message || "Something went wrong.");
    } finally {
        document.getElementById("loading").classList.add("hidden");
        document.getElementById("select").classList.remove("hidden");
    }
});