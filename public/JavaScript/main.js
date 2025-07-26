import { getFormattedDate, getToday, getYesterday } from './utils/utils.js';
import './charts/charts.js';
import './api/api.js';
import './websockets/websockets.js';

document.addEventListener('DOMContentLoaded', () => {
    const todayDateElement = document.getElementById('todayDate');
    const performanceTodayDateElement = document.getElementById('performanceTodayDate');
    const performanceYesterdayDateElement = document.getElementById('performanceYesterdayDate');

    const today = getToday();
    const yesterday = getYesterday();

    if (todayDateElement) {
        todayDateElement.textContent = getFormattedDate(today);
    }
    if (performanceTodayDateElement) {
        performanceTodayDateElement.textContent = getFormattedDate(today);
    }
    if (performanceYesterdayDateElement) {
        performanceYesterdayDateElement.textContent = getFormattedDate(yesterday);
    }
});