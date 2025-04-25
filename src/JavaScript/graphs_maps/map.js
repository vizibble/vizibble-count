/* global L */

// Marker storage
const markers = {};
let currentRoute = null;
let animationMarker = null;
let animationInterval = null;
// Map instance
let map;

// Initialize the map only once with tanker location
function create_map(values) {
    if (!map) {
        map = L.map("map").setView([0, 0], 16);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: "OpenStreetMap",
        }).addTo(map);
    }
    update_map(values);
}

// Update the map location and marker position
function update_map(values) {
    const currentZoom = map.getZoom();

    const { latitude, longitude, number_plate } = values[0];
    const coordinates = values.map(point => [point.latitude, point.longitude]);
    if (currentRoute) map.removeLayer(currentRoute);
    // Draw route line
    currentRoute = L.polyline(coordinates, {
        color: 'red',
        weight: 3,
        opacity: 0.7
    }).addTo(map);
    if (markers[number_plate]) {
        markers[number_plate].setLatLng([latitude, longitude]);
    } else {
        markers[number_plate] = L.marker([latitude, longitude]).addTo(map);
    }
    map.setView([latitude, longitude], currentZoom || 16);

    // animateMarker(coordinates)
}

// Animate marker along the route
function animateMarker(coordinates, duration = 6000) {
    // Clear any existing animation
    if (animationInterval) {
        clearInterval(animationInterval);
    }

    // Remove existing animation marker if it exists
    if (animationMarker) {
        map.removeLayer(animationMarker);
    }

    // Create new marker with custom icon for animation
    animationMarker = L.marker(coordinates[0], {
        icon: L.divIcon({
            className: 'animated-marker',
            html: '<div style="background-color: blue; width: 10px; height: 10px; border-radius: 50%; border: 2px solid white;"></div>'
        })
    }).addTo(map);

    let step = 0;
    const numSteps = coordinates.length;
    const timePerStep = duration / numSteps;

    animationInterval = setInterval(() => {
        step++;

        if (step >= numSteps) {
            clearInterval(animationInterval);
            return;
        }

        animationMarker.setLatLng(coordinates[step]);
    }, timePerStep);
}

// Function to handle play button click
function playRouteAnimation(values) {
    const coordinates = values.map(point => [point.latitude, point.longitude]);
    animateMarker(coordinates);
}

// Stop the animation
function stopRouteAnimation() {
    if (animationInterval) {
        clearInterval(animationInterval);
    }
    if (animationMarker) {
        map.removeLayer(animationMarker);
        animationMarker = null;
    }
}

module.exports = { update_map, create_map, playRouteAnimation, stopRouteAnimation };