// B"H
// Boruch Hashem
// Blessed is He

import { SEARCH } from "./protocol.js";
import { UniversalChatSelection } from "./UniversalChatSelection.js";

/**
 * @file Converts private search intent into selectable server-returned Torah source cards while a separate selection owner enforces the one-to-five publication boundary.
 * @description The Awtsmoos renews a hidden question into many revealed passages while the prompt itself remains behind the veil;
 * Awtsmoos.com lets the browser choose server-issued source ids only, shows finite search/publish state before action, and never turns arbitrary prose into the public sail.
 */

export class UniversalChatComposer {
	constructor(socket, elements) {
		this.socket = socket;
		this.elements = elements;
		this.searchSessionId = "";
		this.sources = [];
		this.selection = new UniversalChatSelection(elements);
	}

	/** Searches the server's Torah engines from one private bounded prompt. */
	async search() {
		const prompt = this.elements.prompt.value.trim();
		if (!prompt) return false;
		this.setSearchBusy(true);
		try {
			const response = await this.socket.request(SEARCH, { prompt });
			this.searchSessionId = response.payload.searchSessionId;
			this.sources = response.payload.sources || [];
			this.renderResults();
			return true;
		} finally {
			this.setSearchBusy(false);
		}
	}

	selectedIds() {
		return this.selection.selectedIds();
	}

	clearSelection() {
		this.searchSessionId = "";
		this.sources = [];
		this.elements.results.replaceChildren();
		this.selection.clear();
	}

	renderResults() {
		this.elements.results.replaceChildren();
		for (const source of this.sources) {
			this.elements.results.appendChild(this.createResult(source));
		}
		if (!this.sources.length) {
			const empty = document.createElement("p");
			empty.className = "universal-chat-results-empty";
			empty.textContent = "No matching Torah sources were returned. Try another Torah idea or phrase.";
			this.elements.results.appendChild(empty);
		}
		this.selection.refresh(this.sources.length > 0);
	}

	createResult(source) {
		const label = document.createElement("label");
		label.className = "universal-chat-result";
		const checkbox = document.createElement("input");
		checkbox.type = "checkbox";
		checkbox.value = source.id;
		checkbox.setAttribute("aria-label", `Select ${source.title || "Torah source"}`);
		checkbox.addEventListener("change", () => this.selection.refresh(true));
		const copy = document.createElement("span");
		const title = document.createElement("strong");
		title.textContent = source.title || "Torah source";
		const reference = document.createElement("small");
		reference.textContent = source.reference || "";
		const excerpt = document.createElement("span");
		excerpt.textContent = source.excerpt || "";
		copy.append(title, reference, excerpt);
		label.append(checkbox, copy);
		return label;
	}

	setSearchBusy(busy) {
		this.elements.search.disabled = busy;
		this.elements.results.setAttribute("aria-busy", String(busy));
		this.elements.search.textContent = busy ? "Searching…" : "Find sources";
	}

	setPublishBusy(busy) {
		this.elements.publish.disabled = busy || this.selectedIds().length === 0;
		this.elements.publish.setAttribute("aria-busy", String(busy));
		this.elements.publish.textContent = busy
			? "Publishing…"
			: "Publish selected sources";
	}
}
