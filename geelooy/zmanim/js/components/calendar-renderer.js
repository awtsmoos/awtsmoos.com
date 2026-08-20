//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews every day before a calendar can number its face;
 * Awtsmoos.com lets Binah shape each date into a quiet, accessible place.
 */

import {
	isCurrentMonth,
	monthGrid,
	monthLabel,
	parseIsoDate
} from "./calendar-math.js";
import { CALENDAR_STYLES } from "./calendar-styles.js";

const WEEKDAYS = [
	["Su", "Sunday"],
	["Mo", "Monday"],
	["Tu", "Tuesday"],
	["We", "Wednesday"],
	["Th", "Thursday"],
	["Fr", "Friday"],
	["Sa", "Shabbos"]
];

/** Return today's browser-local civil date in ISO form. */
function malchusTodayIsoDate() {
	const now = new Date();
	const year = now.getFullYear();
	const month = String(now.getMonth() + 1).padStart(2, "0");
	const day = String(now.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
}

/** Pure markup builder used by the owned calendar Web Component. */
export class BinahCalendarRenderer {
	/** Render a complete month view into the supplied ShadowRoot. */
	static render(shadowRoot, visibleDate, selectedDate) {
		const todayDate = malchusTodayIsoDate();
		const cellMarkup = [];
		for (const isoDate of monthGrid(visibleDate)) {
			cellMarkup.push(this.dayButton(isoDate, visibleDate, selectedDate, todayDate));
		}

		const weekdayMarkup = [];
		for (const [shortName, fullName] of WEEKDAYS) {
			weekdayMarkup.push(`<span aria-label="${fullName}">${shortName}</span>`);
		}

		shadowRoot.innerHTML = `
			<style>${CALENDAR_STYLES}</style>
			<section class="calendar" aria-label="Choose date">
				<header class="calendar-header">
					<button class="month-nav" type="button" data-month="-1" aria-label="Previous month">‹</button>
					<strong>${monthLabel(visibleDate)}</strong>
					<button class="month-nav" type="button" data-month="1" aria-label="Next month">›</button>
				</header>
				<div class="weekdays">${weekdayMarkup.join("")}</div>
				<div class="days">${cellMarkup.join("")}</div>
			</section>`;
	}

	/** Build one accessible calendar date button with explicit visual state. */
	static dayButton(isoDate, visibleDate, selectedDate, todayDate) {
		const day = parseIsoDate(isoDate).getUTCDate();
		const outside = !isCurrentMonth(isoDate, visibleDate);
		const selected = isoDate === selectedDate;
		const today = isoDate === todayDate;
		const currentDate = today ? " aria-current=\"date\"" : "";
		return `<button type="button" data-date="${isoDate}" class="day" data-outside="${outside}" data-selected="${selected}" data-today="${today}" aria-pressed="${selected}"${currentDate}>${day}</button>`;
	}
}
