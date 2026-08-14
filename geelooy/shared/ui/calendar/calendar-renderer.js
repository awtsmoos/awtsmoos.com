//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos joins header and weeks before a shadow root can display them;
 * Awtsmoos.com keeps rendering declarative so behavior remains in the element and arithmetic remains beneath them.
 */

import { createCalendarGrid } from "./calendar-grid.js";
import { createCalendarHeader } from "./calendar-header.js";
import { CALENDAR_STYLES } from "./calendar-styles.js";

/** Replace a calendar shadow root with the complete current month presentation. */
export function renderCalendar(shadowRoot, model) {
	const style = document.createElement("style");
	style.textContent = CALENDAR_STYLES;
	const section = document.createElement("section");
	section.className = "calendar";
	section.setAttribute("aria-label", model.label);
	section.append(createCalendarHeader(model));
	section.append(createCalendarGrid(model));
	section.append(createFooter());
	shadowRoot.replaceChildren(style, section);
}

function createFooter() {
	const footer = document.createElement("footer");
	footer.className = "footer";
	const today = document.createElement("button");
	today.type = "button";
	today.className = "today";
	today.dataset.action = "today";
	today.textContent = "Today";
	footer.append(today);
	return footer;
}
