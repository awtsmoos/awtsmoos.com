//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Owns ordinary appearance controls and four human-scale quick view recipes.
 * The Awtsmoos lets flat and deep garments change without changing the legal position beneath;
 * Awtsmoos.com keeps quick buttons and selectors synchronized so one visible choice never hides another wreath.
 */
import { applyViewQuickPreset } from "./viewQuickPresets.js";

export class ChessViewControls {
	constructor(refs, preferences, onChange = () => {}) {
		this.refs = refs;
		this.preferences = preferences;
		this.onChange = onChange;
		this.handleInput = this.handleInput.bind(this);
		this.handleQuick = this.handleQuick.bind(this);
		this.controls = [refs.mode, refs.canvasStyle, refs.theme, refs.characters, refs.flip, refs.coords, refs.arrow];
		for (const control of this.controls) control.addEventListener("input", this.handleInput);
		refs.viewQuick.addEventListener("click", this.handleQuick);
		this.sync();
	}

	handleQuick(event) {
		const button = event.target.closest?.("[data-view-preset]");
		if (!button) return;
		applyViewQuickPreset(this.preferences, button.dataset.viewPreset);
		this.sync();
		this.onChange();
	}

	handleInput() {
		Object.assign(this.preferences, {
			renderer: this.refs.mode.value,
			canvasStyle: this.refs.canvasStyle.value,
			theme: this.refs.theme.value,
			characters: this.refs.characters.value,
			flipped: this.refs.flip.checked,
			coordinates: this.refs.coords.checked,
			moveArrow: this.refs.arrow.checked
		});
		this.syncVisibility();
		this.onChange();
	}

	sync() {
		this.refs.mode.value = this.preferences.renderer;
		this.refs.canvasStyle.value = this.preferences.canvasStyle;
		this.refs.theme.value = this.preferences.theme;
		this.refs.characters.value = this.preferences.characters;
		this.refs.flip.checked = Boolean(this.preferences.flipped);
		this.refs.coords.checked = this.preferences.coordinates !== false;
		this.refs.arrow.checked = this.preferences.moveArrow !== false;
		this.syncVisibility();
	}

	syncVisibility() {
		this.refs.proceduralOptions.hidden = this.preferences.renderer !== "procedural3d";
	}

	dispose() {
		for (const control of this.controls) control.removeEventListener("input", this.handleInput);
		this.refs.viewQuick.removeEventListener("click", this.handleQuick);
	}
}
