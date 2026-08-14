//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews every date while the calendar opens one gate at a time;
 * Awtsmoos.com gives keyboard, touch, and focus a single accessible rhythm and rhyme.
 */

import {
	parseIsoDate,
	shiftDays,
	shiftMonths
} from "./calendar-math.js";
import { BinahCalendarRenderer } from "./calendar-renderer.js";

/** Owned, dependency-free calendar Web Component for Gregorian date selection. */
export class AwtsmoosZmanimCalendar extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: "open" });
		this.selectedDate = new Date().toISOString().slice(0, 10);
		this.visibleDate = this.selectedDate;
	}

	connectedCallback() {
		this.render();
		this.shadowRoot.addEventListener("click", event => {
			this.handleClick(event);
		});
		this.shadowRoot.addEventListener("keydown", event => {
			this.handleKeydown(event);
		});
	}

	set value(isoDate) {
		if (/^\d{4}-\d{2}-\d{2}$/.test(isoDate || "")) {
			this.selectedDate = isoDate;
			this.visibleDate = isoDate;
			if (this.isConnected) {
				this.render();
			}
		}
	}

	get value() {
		return this.selectedDate;
	}

	handleClick(event) {
		const button = event.target.closest("button");
		if (!button) {
			return;
		}
		if (button.dataset.month) {
			this.visibleDate = shiftMonths(this.visibleDate, Number(button.dataset.month));
			this.render();
			return;
		}
		if (button.dataset.date) {
			this.selectDate(button.dataset.date);
		}
	}

	handleKeydown(event) {
		const button = event.target.closest("button[data-date]");
		if (!button) {
			return;
		}
		const movement = this.keyboardMovement(button.dataset.date, event.key);
		if (movement) {
			event.preventDefault();
			this.focusDate(movement);
		}
	}

	keyboardMovement(isoDate, key) {
		const movements = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
		if (Object.prototype.hasOwnProperty.call(movements, key)) {
			return shiftDays(isoDate, movements[key]);
		}
		if (key === "PageUp" || key === "PageDown") {
			return shiftMonths(isoDate, key === "PageUp" ? -1 : 1);
		}
		const weekday = parseIsoDate(isoDate).getUTCDay();
		if (key === "Home") {
			return shiftDays(isoDate, -weekday);
		}
		if (key === "End") {
			return shiftDays(isoDate, 6 - weekday);
		}
		return null;
	}

	focusDate(isoDate) {
		this.visibleDate = isoDate;
		this.render();
		this.shadowRoot.querySelector(`[data-date="${isoDate}"]`)?.focus();
	}

	selectDate(isoDate) {
		this.selectedDate = isoDate;
		this.visibleDate = isoDate;
		this.render();
		this.dispatchEvent(new CustomEvent("date-change", {
			bubbles: true,
			composed: true,
			detail: { date: isoDate }
		}));
	}

	render() {
		BinahCalendarRenderer.render(this.shadowRoot, this.visibleDate, this.selectedDate);
	}
}

customElements.define("awtsmoos-zmanim-calendar", AwtsmoosZmanimCalendar);
