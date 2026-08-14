//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos gathers every calendar capability before consumers choose the piece they need;
 * Awtsmoos.com exposes one stable shared entrypoint for the element and its pure civil-date seeds.
 */

import "./calendar-element.js";

export { AwtsmoosCalendar } from "./calendar-element.js";
export { buildCalendarModel, monthLabel, weekdayLabels } from "./calendar-model.js";
export { isCalendarNavigationKey, keyboardTarget } from "./calendar-keyboard.js";
export { clampIsoDate, isIsoDate, monthGrid, parseIsoDate, shiftDays, shiftMonths, shiftYears, todayIso, toIsoDate, withinBounds } from "./date-math.js";
