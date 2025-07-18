// Initialize icons
lucide.createIcons();

// Main application
(function () {
    'use strict';

    // Constants and DOM elements
    const socket = io.connect();
    const chartContainer = document.getElementById('hitsChart');
    const todayHitCount = document.getElementById('todayHitCount');
    const widgetsContainer = document.getElementById('widgets');
    const lastUpdatedElement = document.getElementById('lastUpdated');
    const selectButton = document.getElementById("select");
    const loadingButton = document.getElementById("loading");

    // State management
    let state = {
        chartData: [],
        todayHits: 0,
        chartInitialized: false,
        selectedDevice: "",
        chartInstance: null
    };

    // Utility functions
    const utils = {
        isSameDay: (date1, date2) => {
            return date1.getDate() === date2.getDate() &&
                date1.getMonth() === date2.getMonth() &&
                date1.getFullYear() === date2.getFullYear();
        },

        formatDate: (date) => {
            return date.toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                timeZone: 'Asia/Kolkata'
            });
        },

        formatTime: (date) => {
            return date.toLocaleTimeString('en-IN', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                timeZone: 'Asia/Kolkata'
            });
        }
    };

    // Chart functions
    const chartManager = {
        init: (elementId) => {
            if (state.chartInstance) {
                state.chartInstance.dispose();
            }
            state.chartInstance = echarts.init(document.getElementById(elementId));
            window.addEventListener('resize', () => state.chartInstance.resize());
        },

        render: (data) => {
            if (!state.chartInstance) {
                chartManager.init('hitsChart');
            }

            const dates = data.map(entry => {
                const date = new Date(entry.day);
                return utils.formatDate(date);
            });

            const hits = data.map(entry => parseInt(entry.hits, 10));

            const option = {
                title: {
                    text: 'Piece Count per day',
                    left: 'center',
                    textStyle: {
                        fontSize: 16,
                        fontWeight: 'bold'
                    }
                },
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'shadow'
                    },
                    formatter: params => {
                        const date = params[0].name;
                        const value = params[0].value;
                        return <strong>${date}</strong><br />Pieces: ${ value };
                    }
                },
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '3%',
                    containLabel: true
                },
                xAxis: {
                    type: 'category',
                    data: dates,
                },
                yAxis: {
                    type: 'value',
                    name: 'Pieces',
                    nameLocation: 'middle',
                    nameGap: 30
                },
                series: [
                    {
                        name: 'Pieces',
                        type: 'bar',
                        data: hits,
                        itemStyle: {
                            color: '#3b82f6',
                            borderRadius: [4, 4, 0, 0]
                        },
                        emphasis: {
                            itemStyle: {
                                color: '#2563eb'
                            }
                        },
                        barWidth: '60%'
                    }
                ],
                animationDuration: 1000
            };

            state.chartInstance.setOption(option);
        }
    };

    // Data functions
    const dataManager = {
        updateTodayCounter: () => {
            const today = new Date();
            state.todayHits = 0;

            state.chartData.forEach(entry => {
                const entryDate = new Date(entry.day);
                if (utils.isSameDay(entryDate, today)) {
                    state.todayHits = entry.hits;
                }
            });

            todayHitCount.textContent = state.todayHits;
            lastUpdatedElement.textContent = Last updated: ${ utils.formatTime(new Date()) };
        },

        processSocketData: (data) => {
            if (data.connectionID !== state.selectedDevice) return;

            // Show widgets if not already visible
            if (!state.chartInitialized) {
                widgetsContainer.classList.remove('hidden');
                state.chartInitialized = true;
            }

            const now = new Date();
            const dataDate = new Date(data.timestamp);
            const dateKey = utils.formatDate(dataDate);

            const existingEntry = state.chartData.find(d => {
                const existingDate = utils.formatDate(new Date(d.day));
                return existingDate === dateKey;
            });

            if (existingEntry) {
                existingEntry.hits++;
            } else {
                state.chartData.push({ day: data.timestamp, hits: 1 });
            }

            // Update today's counter if the incoming data is from today
            if (utils.isSameDay(dataDate, now)) {
                state.todayHits++;
                todayHitCount.textContent = state.todayHits;
                lastUpdatedElement.textContent = Last updated: ${ utils.formatTime(now) };
            }

            chartManager.render(state.chartData);
        },

        fetchDeviceData: async (deviceId) => {
            try {
                const response = await fetch(/widgets/data ? device = ${ deviceId });
                if (!response.ok) {
                    throw new Error('Failed to fetch data from the server');
                }
                return await response.json();
            } catch (error) {
                console.error("Error during API call:", error.message);
                throw error;
            }
        }
    };

    // UI functions
    const uiManager = {
        showLoading: () => {
            selectButton.disabled = true;
            selectButton.style.display = "none";
            loadingButton.style.display = "inline-flex";
        },

        hideLoading: () => {
            selectButton.disabled = false;
            selectButton.style.display = "flex";
            loadingButton.style.display = "none";
        },

        showPopup: (message, title = "Error", type = "error") => {
            const modal = document.querySelector('.modal');
            const statusText = document.querySelector('.status_text');
            const statusAlertHeading = document.querySelector('.status_alert_heading');

            // Set content based on type
            statusText.textContent = message;
            statusAlertHeading.textContent = title;

            // Adjust styling based on type
            const alertBox = modal.querySelector('div');
            if (type === "error") {
                alertBox.querySelector('div').classList.add('bg-red-100');
                alertBox.classList.add('border-red-500');
                statusAlertHeading.classList.add('text-red-500');
            } else if (type === "success") {
                alertBox.querySelector('div').classList.remove('bg-red-100');
                alertBox.querySelector('div').classList.add('bg-green-100');
                alertBox.classList.remove('border-red-500');
                alertBox.classList.add('border-green-500');
                statusAlertHeading.classList.remove('text-red-500');
                statusAlertHeading.classList.add('text-green-500');
            }

            // Show with animation
            modal.classList.remove('hidden');
            setTimeout(() => {
                modal.classList.remove('opacity-0');
                modal.classList.remove('translate-y-4');
            }, 10);

            // Auto-hide after 5 seconds
            const autoHide = setTimeout(() => {
                uiManager.hidePopup();
            }, 5000);

            // Close button handler
            const closeBtn = modal.querySelector('.close');
            const clickHandler = () => {
                uiManager.hidePopup();
                clearTimeout(autoHide);
                closeBtn.removeEventListener('click', clickHandler);
            };
            closeBtn.addEventListener('click', clickHandler);
        },

        hidePopup: () => {
            const modal = document.querySelector('.modal');
            modal.classList.add('opacity-0');
            modal.classList.add('translate-y-4');
            setTimeout(() => {
                modal.classList.add('hidden');
            }, 300);
        }
    };

    // Event handlers
    const setupEventListeners = () => {
        selectButton.addEventListener("click", async () => {
            const selectedRadio = document.querySelector('input[name="device"]:checked');
            if (!selectedRadio) {
                uiManager.showPopup("Please select a device.", "Selection Required");
                return;
            }

            state.selectedDevice = selectedRadio.value;
            uiManager.showLoading();

            try {
                const values = await dataManager.fetchDeviceData(state.selectedDevice);
                state.chartData = [...values];

                if (state.chartData.length > 0) {
                    widgetsContainer.classList.remove('hidden');
                    state.chartInitialized = true;
                    dataManager.updateTodayCounter();
                    chartManager.render(values);
                } else {
                    widgetsContainer.classList.add('hidden');
                    uiManager.showPopup("No data available for the selected device.", "No Data Found");
                }
            } catch (error) {
                uiManager.showPopup(error.message);
            } finally {
                uiManager.hideLoading();
            }
        });

        // Socket.io event
        socket.on("update", dataManager.processSocketData);
    };

    // Initialize the application
    const init = () => {
        setupEventListeners();
    };

    // Start the app
    init();
})();