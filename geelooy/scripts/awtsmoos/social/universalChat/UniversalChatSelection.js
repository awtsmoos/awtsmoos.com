// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Owns the visible one-to-five source-selection contract for Public Torah search results.
 * @description The Awtsmoos is one before chosen and unchosen sources; Awtsmoos.com lets the human see the finite publication boundary before sending anything in light,
 * disabling additional unchecked cards at five while leaving every checked server-issued source removable and never storing or publishing the private search prompt.
 */

const MAX_SELECTED_SOURCES = 5;

/** Projects checkbox selection into publish readiness, card state, disabled overflow choices, and a live human-readable count. */
export class UniversalChatSelection {
	constructor(elements) {
		this.elements = elements;
	}

	selectedIds() {
		return this.inputs()
			.filter((input) => input.checked)
			.map((input) => input.value)
			.slice(0, MAX_SELECTED_SOURCES);
	}

	refresh(hasResults = true) {
		const inputs = this.inputs();
		const selected = inputs.filter((input) => input.checked);
		const full = selected.length >= MAX_SELECTED_SOURCES;
		for (const input of inputs) {
			input.disabled = full && !input.checked;
			input.closest(".universal-chat-result")
				?.classList.toggle("is-selected", input.checked);
		}
		this.elements.publish.disabled = selected.length === 0;
		this.elements.selectionSummary.textContent = hasResults
			? selectionSummary(selected.length, full)
			: "";
	}

	clear() {
		this.elements.selectionSummary.textContent = "";
		this.elements.publish.disabled = true;
	}

	inputs() {
		return [...this.elements.results.querySelectorAll("input[type=checkbox]")];
	}
}

function selectionSummary(count, full) {
	if (!count) return "Select up to 5 source cards to publish.";
	return `${count} of ${MAX_SELECTED_SOURCES} selected${full ? " · selection limit reached" : ""}.`;
}
