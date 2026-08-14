//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews every day while the full calendar waits quietly until a person asks;
 * Awtsmoos.com keeps yesterday, today, tomorrow, and deep date choice inside one compact task.
 */

import "./calendar-component.js";

/** Compact date navigator with an accessible collapsible owned calendar. */
export class AwtsmoosDateControl extends HTMLElement {
	set data(value) {
		this.viewData = value;
		this.update();
	}

	connectedCallback() {
		this.render();
		this.addEventListener("click", event => {
			this.handleClick(event);
		});
		this.addEventListener("date-change", event => {
			if (event.target.matches("awtsmoos-zmanim-calendar")) {
				this.setCalendarOpen(false);
			}
		});
	}

	handleClick(event) {
		const button = event.target.closest("button[data-action]");
		if (!button) {
			return;
		}
		const action = button.dataset.action;
		if (action === "calendar") {
			const shouldOpen = button.getAttribute("aria-expanded") !== "true";
			this.setCalendarOpen(shouldOpen);
			return;
		}
		if (action === "today") {
			this.dispatchEvent(new CustomEvent("date-today", { bubbles: true }));
			return;
		}
		const delta = action === "previous" ? -1 : 1;
		this.dispatchEvent(new CustomEvent("date-navigate", {
			bubbles: true,
			detail: { delta }
		}));
	}

	setCalendarOpen(open) {
		const trigger = this.querySelector('[data-action="calendar"]');
		const shell = this.querySelector(".date-calendar-shell");
		if (!trigger || !shell) {
			return;
		}
		trigger.setAttribute("aria-expanded", String(open));
		shell.hidden = !open;
	}

	render() {
		this.innerHTML = `
			<div class="date-control">
				<button type="button" class="date-step" data-action="previous" aria-label="Previous day">←</button>
				<button type="button" class="date-trigger" data-action="calendar" aria-expanded="false" aria-controls="date-control-calendar">
					<strong class="date-civil">Choose date</strong><span class="date-hebrew"></span>
				</button>
				<button type="button" class="date-step" data-action="next" aria-label="Next day">→</button>
				<button type="button" class="date-today" data-action="today">Today</button>
			</div>
			<div id="date-control-calendar" class="date-calendar-shell" hidden>
				<awtsmoos-zmanim-calendar></awtsmoos-zmanim-calendar>
			</div>`;
		this.update();
	}

	update() {
		if (!this.isConnected || !this.viewData) {
			return;
		}
		this.querySelector(".date-civil").textContent = this.viewData.civilDate;
		this.querySelector(".date-hebrew").textContent = this.viewData.hebrewDate;
		this.querySelector("awtsmoos-zmanim-calendar").value = this.viewData.date;
	}
}

customElements.define("awtsmoos-date-control", AwtsmoosDateControl);
