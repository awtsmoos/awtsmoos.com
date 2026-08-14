//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos creates the whole measured day while the eye first needs a handful of anchors;
 * Awtsmoos.com reveals six key zmanim quickly, then leaves every deeper detail to the full ranks.
 */

import { selectKeyZmanim } from "../domain/key-zmanim.js";
import { MalchusTimeFormatter } from "../domain/timezone.js";

/** Six high-signal daily zmanim for fast scanning. */
export class AwtsmoosKeyZmanim extends HTMLElement {
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
		section.className = "key-times";
		section.setAttribute("aria-label", "Key times today");
		for (const item of selectKeyZmanim(this.viewData.times)) {
			section.append(this.createItem(item));
		}
		this.append(section);
	}

	createItem(item) {
		const article = document.createElement("article");
		article.className = "key-time";
		if (item.available) {
			article.dataset.status = this.viewData.status.statusById[item.id] || "selected-date";
		} else {
			article.dataset.status = "unavailable";
		}
		const label = document.createElement("span");
		label.textContent = item.label;
		const time = document.createElement("strong");
		if (item.available) {
			time.textContent = MalchusTimeFormatter.time(item.time, this.viewData.timezone);
		} else {
			time.textContent = "—";
		}
		article.append(label, time);
		return article;
	}
}

customElements.define("awtsmoos-key-zmanim", AwtsmoosKeyZmanim);
