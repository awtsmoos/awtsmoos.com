//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews every civil day before attributes and events can contain it;
 * Awtsmoos.com exposes one small calendar element while state, gestures, and rendering remain separate vessels.
 */

import { NetzachCalendarEvents } from "./calendar-events.js";
import { buildCalendarModel } from "./calendar-model.js";
import { renderCalendar } from "./calendar-renderer.js";
import { YesodCalendarState } from "./calendar-state.js";
import { isIsoDate, todayIso } from "./date-math.js";

const OBSERVED_ATTRIBUTES = ["value", "min", "max", "locale", "week-start", "show-outside-days"];

/** Reusable single-date Gregorian calendar Web Component. */
export class AwtsmoosCalendar extends HTMLElement {
	static get observedAttributes() {
		return OBSERVED_ATTRIBUTES;
	}

	constructor() {
		super();
		this.attachShadow({ mode: "open" });
		this.state = new YesodCalendarState(this);
		this.events = new NetzachCalendarEvents(this);
	}

	connectedCallback() {
		this.state.initialize();
		this.events.connect();
		this.render();
	}

	disconnectedCallback() {
		this.events.disconnect();
	}

	attributeChangedCallback(name, oldValue, newValue) {
		if (!this.isConnected || oldValue === newValue) {
			return;
		}
		this.state.syncAttribute(name, newValue);
		this.render();
	}

	get value() {
		return this.state.value;
	}

	set value(value) {
		if (isIsoDate(value)) {
			this.state.select(value);
		}
	}

	render() {
		renderCalendar(this.shadowRoot, buildCalendarModel(this.state.modelOptions()));
	}

	selectDate(value) {
		const selected = this.state.select(value);
		this.dispatchEvent(new CustomEvent("date-change", {
			bubbles: true,
			composed: true,
			detail: { date: selected }
		}));
	}

	focusDate(value) {
		const focused = this.state.focus(value);
		this.render();
		queueMicrotask(() => {
			this.shadowRoot.querySelector(`[data-date="${focused}"]`)?.focus();
		});
	}

	showToday() {
		this.selectDate(this.state.bounded(todayIso()));
	}

	moveMonth(delta) {
		this.publishMonth(this.state.moveMonth(delta));
	}

	jumpToMonth(year, month) {
		const target = this.state.jumpToMonth(year, month);
		if (!target) {
			this.render();
			return;
		}
		this.publishMonth(target);
	}

	publishMonth(target) {
		this.render();
		this.dispatchEvent(new CustomEvent("month-change", {
			bubbles: true,
			composed: true,
			detail: { month: target.slice(0, 7) }
		}));
	}
}

customElements.define("awtsmoos-calendar", AwtsmoosCalendar);
