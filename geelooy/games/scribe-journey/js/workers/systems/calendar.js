
// B"H
// js/workers/systems/calendar.js

import { parshas } from '../../data/library/parshas.js';

export function getCurrentParsha(gameDay) {
    // Game starts at Day 1.
    // Assuming 7 day weeks.
    // Cycle through parshas weekly.
    const weekIndex = Math.floor((gameDay - 1) / 7);
    const parshaIndex = weekIndex % parshas.length;
    return parshas[parshaIndex];
}

export function getHebrewDate(gameDay) {
    // Simplified logic: Day 1 = 1 Tishrei 5785
    const months = ["Tishrei", "Cheshvan", "Kislev", "Tevet", "Shevat", "Adar", "Nisan", "Iyar", "Sivan", "Tammuz", "Av", "Elul"];
    let day = gameDay;
    let monthIndex = 0;
    let year = 5785;
    
    // Approximate month lengths (alternating 30/29)
    while (day > 29) {
        let daysInMonth = (monthIndex % 2 === 0) ? 30 : 29;
        if (day > daysInMonth) {
            day -= daysInMonth;
            monthIndex++;
            if (monthIndex >= 12) {
                monthIndex = 0;
                year++;
            }
        } else {
            break;
        }
    }
    
    return { day, month: months[monthIndex], year };
}
