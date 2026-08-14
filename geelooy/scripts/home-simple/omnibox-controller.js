// B"H
// Boruch Hashem
// Blessed is He
// The Awtsmoos keeps focus in one searching vessel while visible intention moves among verified worlds, memory, and Torah.

import { OmniboxKeyboard } from "./omnibox-keyboard.js";
import { OmniboxLayer } from "./omnibox-layer.js";
import { OmniboxNavigator } from "./omnibox-navigator.js";
import { createOmniboxActions } from "./omnibox-ranking.js";

export class OmniboxController {
	constructor(rootElement, options) {
		this.rootElement = rootElement;
		this.formElement = rootElement.querySelector("form[role='search']");
		this.inputElement = this.formElement.querySelector("input[type='search']");
		this.panelElement = rootElement.querySelector("[data-omnibox-panel]");
		this.renderer = options.renderer;
		this.history = options.history;
		this.recorder = options.recorder;
		this.catalog = options.catalog;
		this.navigator = new OmniboxNavigator();
		this.layer = new OmniboxLayer({
			rootElement,
			inputElement: this.inputElement,
			panelElement: this.panelElement,
			menuRoot: options.menuRoot,
			navigator: this.navigator,
			renderer: this.renderer
		});
		this.keyboard = new OmniboxKeyboard({
			navigator: this.navigator,
			activateHandler: index => this.activate(index),
			activeHandler: index => this.setActive(index),
			closeHandler: () => this.close()
		});
		this.actions = [];
	}

	connect() {
		this.inputElement.addEventListener("focus", () => this.refresh());
		this.inputElement.addEventListener("pointerdown", () => this.refresh());
		this.inputElement.addEventListener("input", () => this.refresh());
		this.inputElement.addEventListener("keydown", event => this.keyboard.handle(event));
		this.panelElement.addEventListener("pointerover", event => this.handlePointerOver(event));
		this.panelElement.addEventListener("click", event => this.handleOptionClick(event));
		this.renderer.clearElement.addEventListener("click", () => this.clearHistory());
		this.formElement.addEventListener("submit", () => this.close());
		document.addEventListener("pointerdown", event => this.handleOutsidePointer(event));
		document.addEventListener("awtsmoosExploreOpening", () => this.close());
		document.addEventListener("awtsmoosProfileOpening", () => this.close());
		return this;
	}

	refresh() {
		const query = this.inputElement.value.trim();
		this.actions = createOmniboxActions(
			query,
			this.history.getSnapshot(),
			this.catalog
		);
		this.navigator.reset(this.actions.length);
		this.renderer.render(this.actions, -1, {
			hasHistory: this.history.hasEntries(),
			heading: query ? "Matching paths" : "Continue or discover",
			query
		});
		this.layer.open();
	}

	close() {
		this.layer.close();
	}

	setActive(index) {
		this.renderer.setActive(index);
		const optionElement = this.renderer.getOption(index);
		if (optionElement) {
			this.inputElement.setAttribute("aria-activedescendant", optionElement.id);
			optionElement.scrollIntoView({ block: "nearest" });
		}
	}

	activate(index) {
		const action = this.actions[index];
		if (!action) {
			return;
		}
		this.recorder.recordAction(action);
		this.close();
		location.assign(action.href);
	}

	handlePointerOver(event) {
		const index = this.renderer.getIndexFromTarget(event.target);
		if (index < 0) {
			return;
		}
		this.setActive(this.navigator.set(index));
	}

	handleOptionClick(event) {
		const index = this.renderer.getIndexFromTarget(event.target);
		if (index >= 0) {
			this.recorder.recordAction(this.actions[index]);
			this.close();
		}
	}

	handleOutsidePointer(event) {
		if (!this.panelElement.hidden && !this.rootElement.contains(event.target)) {
			this.close();
		}
	}

	clearHistory() {
		this.recorder.clear();
		this.refresh();
	}
}
