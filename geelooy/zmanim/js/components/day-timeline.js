//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos stretches no line, yet human sight benefits from seeing the day's measured path;
 * Awtsmoos.com places a true now-marker among five anchors without pretending the track can replace halachah.
 */

import { MalchusTimeFormatter } from "../domain/timezone.js";

const ANCHORS = [
	{ id: "alos", label: "Alos" },
	{ id: "sunrise", label: "Sunrise" },
	{ id: "chatzos", label: "Chatzos" },
	{ id: "sunset", label: "Sunset" },
	{ id: "tzeis", label: "Tzeis" }
];

/** Compact timeline with five textual anchors and an optional current-time marker. */
export class AwtsmoosDayTimeline extends HTMLElement {
	set data(value) {
		this.viewData = value;
		this.render();
	}

	connectedCallback() {
		this.render();
	}

	render() {
		this.replaceChildren();
		if (!this.viewData) {
			return;
		}
		const section = document.createElement("section");
		section.className = "day-timeline";
		section.setAttribute("aria-label", "Major zmanim timeline");
		section.append(this.createTrack(), this.createAnchors());
		this.append(section);
	}

	createTrack() {
		const track = document.createElement("div");
		track.className = "timeline-track";
		const progressValue = this.viewData.status.progress;
		if (progressValue !== null) {
			const percentage = Math.max(0, Math.min(100, progressValue * 100));
			const progress = document.createElement("span");
			progress.className = "timeline-progress";
			progress.style.width = `${percentage}%`;
			const marker = document.createElement("span");
			marker.className = "timeline-marker";
			marker.style.left = `${percentage}%`;
			marker.setAttribute("aria-hidden", "true");
			track.append(progress, marker);
		}
		return track;
	}

	createAnchors() {
		const wrapper = document.createElement("div");
		wrapper.className = "timeline-anchors";
		for (const anchor of ANCHORS) {
			wrapper.append(this.createAnchor(anchor));
		}
		return wrapper;
	}

	createAnchor(anchor) {
		const item = document.createElement("div");
		item.className = "timeline-anchor";
		const label = document.createElement("span");
		label.textContent = anchor.label;
		const value = document.createElement("strong");
		value.textContent = MalchusTimeFormatter.time(
			this.viewData.times[anchor.id],
			this.viewData.timezone
		);
		item.append(label, value);
		return item;
	}
}

customElements.define("awtsmoos-day-timeline", AwtsmoosDayTimeline);
