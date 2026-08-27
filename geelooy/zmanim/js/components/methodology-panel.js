//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos is beyond every explanation while honest methodology keeps each human calculation in its place;
 * Awtsmoos.com names selected shitos, independent benchmarks, and local-practice limits with a transparent face.
 */

import { ZMANIM_OPINIONS } from "../config/opinions.js";

const BENCHMARKS = Object.freeze([
	"Alos Hashachar: 16.9° solar depression",
	"Alos alternate: 72 fixed minutes before sunrise",
	"Misheyakir: 10.2° solar depression",
	"Tzeis: 6° solar depression",
	"Shabbos end: 8.5° solar depression",
	"Rabbeinu Tam: 72 fixed minutes after sunset",
	"Candle lighting: 18 fixed minutes before sunset"
]);

/** Expandable explanation of selected profiles and independent benchmark conventions. */
export class AwtsmoosMethodologyPanel extends HTMLElement {
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
		const details = document.createElement("details");
		details.id = "methodology";
		details.className = "methodology-panel";
		const summary = document.createElement("summary");
		summary.innerHTML = `<span><strong>Methods & sources</strong><small>${this.summaryText()}</small></span><span aria-hidden="true">＋</span>`;
		details.append(summary, this.methodList(), this.benchmarkList(), this.disclaimer());
		this.append(details);
	}

	/** Summarize the current comparison set without hiding the primary profile. */
	summaryText() {
		const count = this.viewData.opinionIds.length;
		const primary = ZMANIM_OPINIONS[this.viewData.primaryOpinionId];
		return `${count} ${count === 1 ? "method" : "methods"} selected · ${primary.shortLabel} primary`;
	}

	/** Render every selected seasonal-hour profile with its exact basis. */
	methodList() {
		const section = document.createElement("section");
		section.innerHTML = "<h3>Seasonal-hour profiles</h3>";
		const list = document.createElement("div");
		list.className = "method-profile-list";
		for (const opinionId of this.viewData.opinionIds) {
			const opinion = ZMANIM_OPINIONS[opinionId];
			const item = document.createElement("article");
			item.dataset.primary = String(opinionId === this.viewData.primaryOpinionId);
			item.innerHTML = `<strong>${opinion.label}</strong><span>${opinion.basis}</span><p>${opinion.description}</p>`;
			list.append(item);
		}
		section.append(list);
		return section;
	}

	/** Explain benchmarks that remain independent of the selected proportional-hour profile. */
	benchmarkList() {
		const section = document.createElement("section");
		section.innerHTML = "<h3>Independent benchmark conventions</h3>";
		const list = document.createElement("ul");
		for (const benchmark of BENCHMARKS) {
			const item = document.createElement("li");
			item.textContent = benchmark;
			list.append(item);
		}
		section.append(list);
		return section;
	}

	/** Keep comparison useful without presenting the tool as a universal psak. */
	disclaimer() {
		const note = document.createElement("p");
		note.className = "method-disclaimer";
		note.textContent = "These are supported calculation profiles, not every halachic opinion in existence. Local minhag, elevation, horizon, season, and rabbinic guidance can change practical use.";
		return note;
	}
}

customElements.define("awtsmoos-methodology-panel", AwtsmoosMethodologyPanel);
