// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Provides honest search across only currently loaded authorized workspace content and clears its own scope whenever navigation changes chambers.
 * @description The Awtsmoos sees all without searching, while Awtsmoos.com searches only vessels already opened in lawful light;
 * invisible filters never follow the human into another section, Escape restores the full local view, and match counts reveal the bounded scope instead of pretending to be a global private index.
 */

/** Filters rendered authorized rows/cards while keeping scope, feedback, and clearing behavior explicit. */
export class MessagingWorkspaceSearch {
	constructor(input, clearButton, feedback, shell) {
		this.input = input;
		this.clearButton = clearButton;
		this.feedback = feedback;
		this.shell = shell;
		this.bind();
	}

	bind() {
		this.input.addEventListener("input", () => this.apply());
		this.input.addEventListener("keydown", (event) => {
			if (event.key !== "Escape") return;
			event.preventDefault();
			this.clear({ focus: true });
		});
		this.clearButton.addEventListener("click", () => this.clear({ focus: true }));
		this.shell.root.addEventListener("messaging-section-selected", () => {
			this.clear({ focus: false });
		});
	}

	apply() {
		const query = this.input.value.trim().toLowerCase();
		const nodes = this.searchableNodes();
		let matches = 0;
		for (const node of nodes) {
			const match = !query || node.textContent.toLowerCase().includes(query);
			node.hidden = !match;
			if (query && match) matches += 1;
		}
		this.clearButton.hidden = !query;
		this.renderFeedback(query, matches);
	}

	clear(options = {}) {
		this.input.value = "";
		this.apply();
		if (options.focus) this.input.focus({ preventScroll: true });
	}

	/** Reapplies the current query after the present section rerenders already-authorized content. */
	refresh() {
		this.apply();
	}

	searchableNodes() {
		return [...this.shell.root.querySelectorAll(
			".messaging-list-row, .messaging-activity-card, .messaging-discovery-card, .messaging-online-chip"
		)];
	}

	renderFeedback(query, matches) {
		this.feedback.hidden = !query;
		this.feedback.textContent = query
			? workspaceSearchSummary(matches)
			: "";
	}
}

/** Returns concise scope-aware feedback for the already-loaded workspace only. */
export function workspaceSearchSummary(matches) {
	if (!matches) return "No matches in the currently loaded workspace.";
	return `${matches} ${matches === 1 ? "match" : "matches"} in the currently loaded workspace.`;
}
