//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews date, month, and boundary before component state can remember them;
 * Awtsmoos.com keeps shared civil-date state separate from DOM events so any future shell can enter them.
 */

import { clampIsoDate, isIsoDate, shiftMonths, todayIso } from "./date-math.js";

/** Own neutral calendar value, visible month, focus date, locale, and bounds. */
export class YesodCalendarState {
	constructor(host) {
		this.host = host;
	}

	initialize() {
		const candidate = this.host.getAttribute("value");
		const initial = isIsoDate(candidate) ? candidate : todayIso();
		this.activeDate = initial;
		this.viewDate = initial;
		if (candidate !== initial) {
			this.host.setAttribute("value", initial);
		}
	}

	get value() {
		const value = this.host.getAttribute("value");
		return isIsoDate(value) ? value : todayIso();
	}

	syncAttribute(name, value) {
		if (name === "value" && isIsoDate(value)) {
			this.activeDate = value;
			this.viewDate = value;
		}
	}

	modelOptions() {
		return {
			value: this.value,
			viewDate: this.viewDate || this.value,
			activeDate: this.activeDate || this.value,
			today: todayIso(),
			locale: this.locale(),
			weekStart: this.weekStart(),
			min: this.bound("min"),
			max: this.bound("max"),
			showOutsideDays: this.host.hasAttribute("show-outside-days")
		};
	}

	locale() {
		return this.host.getAttribute("locale") || globalThis.navigator?.language || "en-US";
	}

	weekStart() {
		const value = Number(this.host.getAttribute("week-start") || 0);
		return Number.isInteger(value) && value >= 0 && value <= 6 ? value : 0;
	}

	bound(name) {
		const value = this.host.getAttribute(name);
		return isIsoDate(value) ? value : "";
	}

	bounded(value) {
		return clampIsoDate(value, this.bound("min"), this.bound("max"));
	}

	select(value) {
		const bounded = this.bounded(value);
		this.activeDate = bounded;
		this.viewDate = bounded;
		this.host.setAttribute("value", bounded);
		return bounded;
	}

	focus(value) {
		const bounded = this.bounded(value);
		this.activeDate = bounded;
		this.viewDate = bounded;
		return bounded;
	}

	moveMonth(delta) {
		return this.setView(shiftMonths(this.viewDate || this.value, delta));
	}

	jumpToMonth(year, month) {
		if (!Number.isInteger(year) || year < 1 || year > 9999 || month < 0 || month > 11) {
			return null;
		}
		const target = `${String(year).padStart(4, "0")}-${String(month + 1).padStart(2, "0")}-01`;
		return this.setView(target);
	}

	setView(value) {
		const bounded = this.bounded(value);
		this.viewDate = bounded;
		this.activeDate = bounded;
		return bounded;
	}
}
