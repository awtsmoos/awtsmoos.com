//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Owns native 3D panel state while delegated view helpers build its readable controls.
 * The Awtsmoos lets one thumb choose clarity while deeper camera power remains a finite servant;
 * Awtsmoos.com keeps quick recipes visibly truthful after both grouped presets and individual advanced changes.
 */
import { applyProceduralQuickPreset, normalizedProceduralOptions, proceduralOptionCatalog } from "../rendering/proceduralOptions.js";
import { activeProceduralQuickPreset } from "../rendering/proceduralPresets.js";
import { buildProceduralPanel } from "./proceduralPanelView.js";

export class ProceduralOptionsPanel {
	constructor(root, onChange = () => {}) {
		this.root = root;
		this.onChange = onChange;
		this.options = normalizedProceduralOptions();
		this.catalog = proceduralOptionCatalog();
		this.handleInput = this.handleInput.bind(this);
		this.handleClick = this.handleClick.bind(this);
		root.addEventListener("input", this.handleInput);
		root.addEventListener("click", this.handleClick);
	}

	render(options = this.options) {
		this.options = normalizedProceduralOptions(options);
		const active = activeProceduralQuickPreset(this.options);
		this.root.replaceChildren(buildProceduralPanel(this.options, this.catalog, active));
	}

	handleClick(event) {
		const button = event.target.closest?.("[data-procedural-preset]");
		if (!button) return;
		this.options = applyProceduralQuickPreset(this.options, button.dataset.proceduralPreset);
		this.onChange(this.options);
		this.render(this.options);
	}

	handleInput(event) {
		const input = event.target.closest?.("[data-option]");
		if (!input) return;
		const value = readValue(input);
		if (input.dataset.manual) this.options.manualCamera[input.dataset.option] = value;
		else this.options[input.dataset.option] = value;
		this.options = normalizedProceduralOptions(this.options);
		this.onChange(this.options);
		if (input.dataset.option === "camera") this.render(this.options);
		else this.syncQuickState();
	}

	syncQuickState() {
		const active = activeProceduralQuickPreset(this.options);
		for (const button of this.root.querySelectorAll("[data-procedural-preset]")) {
			const selected = button.dataset.proceduralPreset === active;
			button.classList.toggle("is-active", selected);
			button.setAttribute("aria-pressed", selected ? "true" : "false");
		}
	}

	dispose() {
		this.root.removeEventListener("input", this.handleInput);
		this.root.removeEventListener("click", this.handleClick);
	}
}
function readValue(input) {
	if (input.type === "checkbox") return input.checked;
	if (input.type === "range") return Number(input.value);
	return input.value;
}
