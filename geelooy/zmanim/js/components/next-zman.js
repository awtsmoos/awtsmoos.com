//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews the coming instant before a countdown can approach its gate;
 * Awtsmoos.com keeps the clock small and lets a separate view reveal the surrounding daily state.
 */

import { TiferesNextZmanView } from "./next-zman-view.js";

/** Coordinate next-zman rendering, countdown refresh, and rollover notification. */
export class AwtsmoosNextZman extends HTMLElement {
	set data(value) {
		this.viewData = value;
		this.expiredNotified = false;
		this.render();
	}

	connectedCallback() {
		this.render();
		this.timer = setInterval(() => {
			this.refreshCountdown();
		}, 30000);
	}

	disconnectedCallback() {
		clearInterval(this.timer);
	}

	render() {
		this.replaceChildren();
		if (!this.viewData) {
			return;
		}
		if (!this.viewData.status.isToday) {
			this.append(TiferesNextZmanView.selectedDate(this.viewData.dateLabel));
			return;
		}
		if (!this.viewData.status.next) {
			this.append(TiferesNextZmanView.completedDay());
			return;
		}
		this.append(TiferesNextZmanView.live(this.viewData));
		this.refreshCountdown();
	}

	refreshCountdown() {
		const countdown = this.querySelector(".next-countdown[data-target]");
		if (!countdown) {
			return;
		}
		const remaining = new Date(countdown.dataset.target).getTime() - Date.now();
		if (remaining <= 0) {
			countdown.textContent = "updating…";
			this.notifyExpired();
			return;
		}
		const totalMinutes = Math.ceil(remaining / 60000);
		const hours = Math.floor(totalMinutes / 60);
		const minutes = totalMinutes % 60;
		if (hours) {
			countdown.textContent = `in ${hours}h ${minutes}m`;
		} else {
			countdown.textContent = `in ${minutes}m`;
		}
	}

	notifyExpired() {
		if (this.expiredNotified) {
			return;
		}
		this.expiredNotified = true;
		this.dispatchEvent(new CustomEvent("zman-clock-tick", {
			bubbles: true
		}));
	}
}

customElements.define("awtsmoos-next-zman", AwtsmoosNextZman);
