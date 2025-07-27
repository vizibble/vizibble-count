export function showModal(heading, text) {
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

export function getCurrentShiftIST() {
    const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
    const hour = now.getHours();

    if (hour >= 6 && hour < 14) return "Morning (6 AM - 2 PM)";
    if (hour >= 14 && hour < 22) return "Afternoon (2 PM - 10 PM)";
    return "Night (10 PM - 6 AM)";
}

export function throttle(fn, delay) {
    let lastCall = 0;
    return function (...args) {
        const now = new Date().getTime();
        if (now - lastCall >= delay) {
            lastCall = now;
            fn.apply(this, args);
        }
    };
}

export function getFormattedDate(date, options = { weekday: 'long', month: 'long', day: 'numeric' }) {
    return date.toLocaleDateString(undefined, options);
}

export function getToday() {
    const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
    const today = new Date(now);
    if (now.getHours() < 6) {
        today.setDate(now.getDate() - 1);
    }
    return today;
}

export function getYesterday() {
    const today = getToday();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    return yesterday;
}

export function updateStatus(status) {
    const statusEl = document.getElementById("metaStatus");
    statusEl.classList.remove("status-low", "status-high", "status-on", "status-off");

    switch (status.toUpperCase()) {
        case "LOW":
            statusEl.classList.add("status-low");
            statusEl.innerText = 'INACTIVE';
            break;
        case "HIGH":
            statusEl.classList.add("status-high");
            statusEl.innerText = 'ACTIVE';
            break;
    }
}
