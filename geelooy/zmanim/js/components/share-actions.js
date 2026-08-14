//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos needs no copying, yet people share useful light from one vessel to another;
 * Awtsmoos.com makes links and daily zmanim portable for a friend, family, or brother.
 */

import { ZMAN_DEFINITIONS } from "../config/zmanim.js";
import { MalchusTimeFormatter } from "../domain/timezone.js";

/** Copy-link and copy-day actions with an old-browser fallback. */
export class AwtsmoosShareActions extends HTMLElement {
	set data(value) {
		this.viewData = value;
		this.render();
	}

	connectedCallback() {
		this.render();
		this.addEventListener("click", event => {
			this.handleClick(event);
		});
	}

	async handleClick(event) {
		const button = event.target.closest("button[data-copy]");
		if (!button || !this.viewData) {
			return;
		}
		const text = button.dataset.copy === "link"
			? globalThis.location.href
			: this.dayText();
		try {
			await this.copy(text);
			this.setStatus(button.dataset.copy === "link" ? "Link copied." : "Zmanim copied.");
		} catch (error) {
			this.setStatus("Copy was blocked by this browser.");
		}
	}

	async copy(text) {
		if (navigator.clipboard?.writeText) {
			await navigator.clipboard.writeText(text);
			return;
		}
		const textarea = document.createElement("textarea");
		textarea.value = text;
		textarea.setAttribute("readonly", "");
		document.body.append(textarea);
		textarea.select();
		const copied = document.execCommand("copy");
		textarea.remove();
		if (!copied) {
			throw new Error("Copy command failed.");
		}
	}

	dayText() {
		const lines = [
			`${this.viewData.location.label} — ${this.viewData.dateLabel}`,
			this.viewData.opinionLabel
		];
		for (const definition of ZMAN_DEFINITIONS) {
			const time = this.viewData.times[definition.id];
			lines.push(`${definition.label}: ${MalchusTimeFormatter.time(time, this.viewData.location.timezone)}`);
		}
		lines.push(globalThis.location.href);
		return lines.join("\n");
	}

	setStatus(message) {
		const status = this.querySelector(".share-status");
		if (status) {
			status.textContent = message;
		}
	}

	render() {
		this.innerHTML = `<div class="share-actions"><button type="button" data-copy="link">Copy link</button><button type="button" data-copy="day">Copy all zmanim</button><span class="share-status" aria-live="polite"></span></div>`;
	}
}

customElements.define("awtsmoos-share-actions", AwtsmoosShareActions);
