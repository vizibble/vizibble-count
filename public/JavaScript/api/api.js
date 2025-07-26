import { renderBarChart, renderLineChart } from '../charts/charts.js';
import { getCurrentShiftIST, showModal } from '../utils/utils.js';

export let active_connection = "";
export let shift_count = 0;

export function updateShiftCount(newCount) {
    shift_count = newCount;
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
        const shiftCount = Number(shiftData.reduce((sum, e) => sum + Number(e.todayCount), 0));
        $('#shiftHitCount').sevenSeg({ value: shiftCount, digits: String(shiftCount).length, decimalPoint: false });
        shift_count = shiftCount;

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
