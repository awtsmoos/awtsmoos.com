//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos contains every gesture before click, change, or keydown give it a browser name;
 * Awtsmoos.com keeps generic calendar event wiring apart from state and rendering so each layer stays tame.
 */

import { isCalendarNavigationKey, keyboardTarget } from "./calendar-keyboard.js";

/** Bind semantic user gestures to the public calendar element methods. */
export class NetzachCalendarEvents {
	constructor(owner) {
		this.owner = owner;
		this.handleClick = this.handleClick.bind(this);
		this.handleChange = this.handleChange.bind(this);
		this.handleKeydown = this.handleKeydown.bind(this);
	}

	connect() {
		this.owner.shadowRoot.addEventListener("click", this.handleClick);
		this.owner.shadowRoot.addEventListener("change", this.handleChange);
		this.owner.shadowRoot.addEventListener("keydown", this.handleKeydown);
	}

	disconnect() {
		this.owner.shadowRoot.removeEventListener("click", this.handleClick);
		this.owner.shadowRoot.removeEventListener("change", this.handleChange);
		this.owner.shadowRoot.removeEventListener("keydown", this.handleKeydown);
	}

	handleClick(event) {
		const day = event.target.closest("button[data-date]");
		if (day && !day.disabled) {
			this.owner.selectDate(day.dataset.date);
			return;
		}
		const action = event.target.closest("button[data-action]")?.dataset.action;
		if (action === "previous") {
			this.owner.moveMonth(-1);
		} else if (action === "next") {
			this.owner.moveMonth(1);
		} else if (action === "today") {
			this.owner.showToday();
		}
	}

	handleChange(event) {
		const action = event.target.dataset.action;
		if (action !== "month" && action !== "year") {
			return;
		}
		const monthElement = this.owner.shadowRoot.querySelector('[data-action="month"]');
		const yearElement = this.owner.shadowRoot.querySelector('[data-action="year"]');
		this.owner.jumpToMonth(Number(yearElement.value), Number(monthElement.value));
	}

	handleKeydown(event) {
		const day = event.target.closest("button[data-date]");
		if (!day || !isCalendarNavigationKey(event.key)) {
			return;
		}
		event.preventDefault();
		const target = keyboardTarget(day.dataset.date, event.key, {
			weekStart: this.owner.state.weekStart(),
			shiftKey: event.shiftKey
		});
		this.owner.focusDate(target);
	}
}
