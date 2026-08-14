//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews each zman while deep notes wait until the reader asks to unfold them;
 * Awtsmoos.com turns eighteen large cards into compact rows without hiding any calculated gem.
 */

import { ZMAN_DEFINITIONS, ZMAN_GROUPS } from "../config/zmanim.js";
import { MalchusTimeFormatter } from "../domain/timezone.js";

/** Dense grouped presentation of all calculated zmanim with expandable methodology notes. */
export class AwtsmoosZmanimGrid extends HTMLElement {
	set data(value) {
		this.viewData = value;
		this.render();
	}

	connectedCallback() {
		this.render();
	}

	render() {
		this.replaceChildren();
		if (!this.viewData) return;
		for (const group of ZMAN_GROUPS) this.append(this.createGroup(group));
	}

	createGroup(group) {
		const section = document.createElement("section");
		section.className = "zman-group";
		const heading = document.createElement("h3");
		heading.textContent = group.label;
		const list = document.createElement("div");
		list.className = "zman-card-grid";
		for (const definition of ZMAN_DEFINITIONS) {
			if (definition.group === group.id) list.append(this.createCard(definition));
		}
		section.append(heading, list);
		return section;
	}

	createCard(definition) {
		const card = document.createElement("article");
		card.className = "zman-card";
		const instant = this.viewData.times[definition.id];
		const available = instant instanceof Date && !Number.isNaN(instant.getTime());
		const status = available
			? this.viewData.status?.statusById?.[definition.id] || "selected-date"
			: "unavailable";
		card.dataset.status = status;
		const primary = document.createElement("div");
		primary.className = "zman-primary";
		const label = document.createElement("h4");
		label.textContent = definition.label;
		const time = document.createElement("strong");
		time.className = "zman-time";
		time.textContent = available
			? MalchusTimeFormatter.time(instant, this.viewData.timezone)
			: "Not reached";
		primary.append(label, time);
		card.append(primary, this.detail(definition, available));
		if (status === "next") card.prepend(this.badge("Next"));
		if (!available) card.prepend(this.badge("Unavailable"));
		return card;
	}

	badge(text) {
		const badge = document.createElement("span");
		badge.className = "zman-status";
		badge.textContent = text;
		return badge;
	}

	detail(definition, available) {
		if (!available) {
			const note = document.createElement("p");
			note.className = "zman-unavailable-note";
			note.textContent = "This solar event is not reached here on this date; ask a rav for high-latitude guidance.";
			return note;
		}
		const details = document.createElement("details");
		details.className = "zman-note-details";
		const summary = document.createElement("summary");
		summary.textContent = "Method";
		const note = document.createElement("p");
		note.textContent = definition.note;
		details.append(summary, note);
		return details;
	}
}

customElements.define("awtsmoos-zmanim-grid", AwtsmoosZmanimGrid);
