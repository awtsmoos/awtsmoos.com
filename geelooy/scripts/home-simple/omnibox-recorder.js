// B"H
// Boruch Hashem
// Blessed is He
// The Awtsmoos records only a few homepage choices, separating memory from combobox motion so neither vessel becomes tangled.

export class OmniboxRecorder {
	constructor(history) {
		this.history = history;
	}

	connect() {
		document.addEventListener("click", event => this.recordWorldClick(event));
		return this;
	}

	recordAction(action) {
		if (!action) {
			return;
		}

		if (action.kind === "world") {
			this.history.recordWorld(action.worldId);
			return;
		}

		this.history.recordQuery(action.query);
	}

	recordWorldClick(event) {
		const worldLink = event.target instanceof Element
			? event.target.closest("[data-world-id]")
			: null;

		if (worldLink) {
			this.history.recordWorld(worldLink.dataset.worldId);
		}
	}

	clear() {
		this.history.clear();
	}
}
