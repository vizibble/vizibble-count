const select_Button = document.getElementById("select");
const loading_Button = document.getElementById("loading");
let selectedTanker = "";
let factor = 1;

const { update_graph_data, update_graph } = require("./graph.js");
const { update_map, create_map } = require("./map.js");
const { update_gauge, create_gauge } = require("./gauge.js");
const { show_popup } = require("./popup.js");

/* global io */
const socket = io.connect();

function initializeTankerSelection() {
    select_Button.addEventListener("click", async () => {
        if (!document.querySelector('input[name="device"]:checked')) {
            alert("Please select a tanker.");
            return;
        }
        selectedTanker = document.querySelector('input[name="device"]:checked').value;
        const range = document.querySelector('input[name="range"]:checked').value;
        select_Button.disabled = true;
        select_Button.style.display = "none";
        loading_Button.style.display = "inline-flex";

        try {
            const response = await fetch(`/widgets/data?tanker=${selectedTanker}&range=${range}`);

            if (!response.ok) { throw new Error('Failed to fetch data from the server') }

            const values = await response.json();
            document.querySelectorAll('.widget').forEach(widget => { widget.classList.remove('hidden') });
            factor = values[0]?.factor || 1;
            create_map(values);
            update_graph_data(values, selectedTanker);
            create_gauge(values[0], selectedTanker);
        } catch (error) {
            console.error("Error during API call:", error);
            show_popup("Error");
        } finally {
            select_Button.disabled = false;
            select_Button.style.display = "flex";
            loading_Button.style.display = "none";
        }
    });
}

socket.on("Widget-Update", ({ fuel, numberPlate, longitude, latitude }) => {
    if (numberPlate == selectedTanker) {
        update_graph(fuel * factor);
        update_map({ latitude, longitude, numberPlate });
        update_gauge(fuel * factor);
    }
});

socket.on("Popup-Alert", ({ status }) => {
    show_popup(status);
});

initializeTankerSelection();