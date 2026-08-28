//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Coordinates appearance controls with safe 2D, 2.5D, and lazy native procedural 3D rendering.
 * The Awtsmoos changes garments while the game remains one light;
 * Awtsmoos.com falls back with grace if a GPU cannot bear the deeper sight.
 */
import { savePreferences } from "../config/preferences.js";
import { normalizedProceduralOptions } from "../rendering/proceduralOptions.js";
import { ChessRendererHost } from "../rendering/rendererHost.js";
import { ProceduralOptionsPanel } from "./proceduralOptionsPanel.js";

export class ChessViewController {
	constructor(refs, preferences, onStatus = () => {}) {
		this.refs = refs;
		this.preferences = preferences;
		this.onStatus = onStatus;
		this.host = new ChessRendererHost(refs.preview);
		this.frame = null;
		this.proceduralOptions = normalizedProceduralOptions(preferences);
		this.proceduralPanel = new ProceduralOptionsPanel(refs.proceduralOptions, options => this.updateProcedural(options));
		this.bindControls();
		this.syncControls();
	}

	async render(frame = this.frame) {
		this.frame = frame;
		if (!frame) return;
		try {
			await this.host.update(frame, this.renderOptions());
		} catch (error) {
			if (this.preferences.renderer !== "procedural3d") throw error;
			this.preferences.renderer = "canvas25d";
			this.refs.mode.value = "canvas25d";
			savePreferences(this.preferences);
			this.refs.proceduralOptions.hidden = true;
			this.onStatus(`3D fallback: ${error.message}`);
			await this.host.update(frame, this.renderOptions());
		}
	}

	renderOptions() {
		return {
			...this.proceduralOptions,
			mode: this.preferences.renderer,
			theme: this.preferences.theme,
			characters: this.preferences.characters,
			flipped: this.preferences.flipped,
			coordinates: this.preferences.coordinates,
			moveArrow: this.preferences.moveArrow
		};
	}

	resize() {
		this.host.resize();
	}

	dispose() {
		this.proceduralPanel.dispose();
		this.host.dispose();
	}

	bindControls() {
		for (const control of [this.refs.mode, this.refs.theme, this.refs.characters, this.refs.flip, this.refs.coords, this.refs.arrow]) {
			control.addEventListener("input", () => this.updateBase());
		}
	}

	updateBase() {
		this.preferences.renderer = this.refs.mode.value;
		this.preferences.theme = this.refs.theme.value;
		this.preferences.characters = this.refs.characters.value;
		this.preferences.flipped = this.refs.flip.checked;
		this.preferences.coordinates = this.refs.coords.checked;
		this.preferences.moveArrow = this.refs.arrow.checked;
		this.refs.proceduralOptions.hidden = this.preferences.renderer !== "procedural3d";
		savePreferences(this.preferences);
		this.render().catch(error => this.onStatus(error.message));
	}

	updateProcedural(options) {
		this.proceduralOptions = options;
		Object.assign(this.preferences, options);
		savePreferences(this.preferences);
		this.render().catch(error => this.onStatus(error.message));
	}

	syncControls() {
		this.refs.flip.checked = Boolean(this.preferences.flipped);
		this.refs.coords.checked = this.preferences.coordinates !== false;
		this.refs.arrow.checked = this.preferences.moveArrow !== false;
		this.refs.proceduralOptions.hidden = this.preferences.renderer !== "procedural3d";
		this.proceduralPanel.render(this.proceduralOptions);
	}
}
