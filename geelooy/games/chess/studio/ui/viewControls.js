//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Owns ordinary appearance controls and truthful quick-view selection state.
 * The Awtsmoos lets board palette, piece garment, character family, motion, and depth change without changing legality;
 * Awtsmoos.com keeps buttons, selectors, stored preferences, and the visible renderer speaking one truth.
 */
import { activeViewQuickPreset, applyViewQuickPreset } from "./viewQuickPresets.js";

export class ChessViewControls {
	constructor(refs, preferences, onChange = () => {}) {
		this.refs = refs;
		this.preferences = preferences;
		this.onChange = onChange;
		this.handleInput = this.handleInput.bind(this);
		this.handleQuick = this.handleQuick.bind(this);
		this.controls = [refs.mode, refs.previewMotion, refs.canvasStyle, refs.canvasPieceStyle, refs.theme, refs.characters, refs.flip, refs.coords, refs.arrow];
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
		Object.assign(this.preferences, this.values());
		this.syncVisibility();
		this.syncQuickState();
		this.onChange();
	}

	values() {
		return {
			renderer: this.refs.mode.value, previewMotion: this.refs.previewMotion.value,
			canvasStyle: this.refs.canvasStyle.value, canvasPieceStyle: this.refs.canvasPieceStyle.value,
			theme: this.refs.theme.value, characters: this.refs.characters.value,
			flipped: this.refs.flip.checked, coordinates: this.refs.coords.checked, moveArrow: this.refs.arrow.checked
		};
	}

	sync() {
		for (const [ref, value] of [[this.refs.mode, this.preferences.renderer], [this.refs.previewMotion, this.preferences.previewMotion || "animated"], [this.refs.canvasStyle, this.preferences.canvasStyle], [this.refs.canvasPieceStyle, this.preferences.canvasPieceStyle || "crisp"], [this.refs.theme, this.preferences.theme], [this.refs.characters, this.preferences.characters]]) ref.value = value;
		this.refs.flip.checked = Boolean(this.preferences.flipped);
		this.refs.coords.checked = this.preferences.coordinates !== false;
		this.refs.arrow.checked = this.preferences.moveArrow !== false;
		this.syncVisibility();
		this.syncQuickState();
	}

	syncQuickState() {
		const active = activeViewQuickPreset(this.preferences);
		for (const button of this.refs.viewQuick.querySelectorAll("[data-view-preset]")) {
			const selected = button.dataset.viewPreset === active;
			button.classList.toggle("is-active", selected);
			button.setAttribute("aria-pressed", selected ? "true" : "false");
		}
	}

	syncVisibility() { this.refs.proceduralOptions.hidden = this.preferences.renderer !== "procedural3d"; }
	dispose() {
		for (const control of this.controls) control.removeEventListener("input", this.handleInput);
		this.refs.viewQuick.removeEventListener("click", this.handleQuick);
	}
}
