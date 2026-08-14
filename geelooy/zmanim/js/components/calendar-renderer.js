//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos lets six weeks of dates appear without burdening the chooser's mind;
 * Awtsmoos.com separates calendar markup from keyboard behavior so each vessel stays refined.
 */

import {
	isCurrentMonth,
	monthGrid,
	monthLabel,
	parseIsoDate
} from "./calendar-math.js";
import { KETER_CALENDAR_STYLES } from "./calendar-styles.js";

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

/** Pure markup builder used by the owned calendar Web Component. */
export class BinahCalendarRenderer {
	/** Render a complete month view into the supplied ShadowRoot. */
	static render(shadowRoot, visibleDate, selectedDate) {
		const cellMarkup = [];
		for (const isoDate of monthGrid(visibleDate)) {
			cellMarkup.push(this.dayButton(isoDate, visibleDate, selectedDate));
		}
		const weekdayMarkup = [];
		for (const day of WEEKDAYS) {
			weekdayMarkup.push(`<span class="weekday">${day}</span>`);
		}
		shadowRoot.innerHTML = `${KETER_CALENDAR_STYLES}
			<section aria-label="Choose date">
				<header>
					<button type="button" data-month="-1" aria-label="Previous month">‹</button>
					<strong>${monthLabel(visibleDate)}</strong>
					<button type="button" data-month="1" aria-label="Next month">›</button>
				</header>
				<div class="weekdays">${weekdayMarkup.join("")}</div>
				<div class="grid">${cellMarkup.join("")}</div>
			</section>`;
	}

	/** Build one accessible calendar date button. */
	static dayButton(isoDate, visibleDate, selectedDate) {
		const day = parseIsoDate(isoDate).getUTCDate();
		const selected = isoDate === selectedDate;
		const mutedClass = isCurrentMonth(isoDate, visibleDate) ? "" : " muted";
		const selectedAttribute = selected ? "data-selected" : "";
		return `<button type="button" data-date="${isoDate}" class="day${mutedClass}" aria-pressed="${selected}" ${selectedAttribute}>${day}</button>`;
	}
}
