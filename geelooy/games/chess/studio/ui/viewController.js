//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Orchestrates appearance, ordinary rendering, native live transition service, and graceful renderer fallback.
 * The Awtsmoos joins changing garments with lawful frames while each helper carries only its fitting part;
 * Awtsmoos.com keeps the view controller spacious and clear as motion, controls, and procedural depth reveal one heart.
 */
import { savePreferences } from "../config/preferences.js";
import { normalizedProceduralOptions } from "../rendering/proceduralOptions.js";
import { ChessRendererHost } from "../rendering/rendererHost.js";
import { ProceduralOptionsPanel } from "./proceduralOptionsPanel.js";
import { ChessViewControls } from "./viewControls.js";
import { ChessViewTransition } from "./viewTransition.js";

export class ChessViewController {
	constructor(refs, preferences, onStatus = () => {}) {
		this.refs = refs;
		this.preferences = preferences;
		this.onStatus = onStatus;
		this.host = new ChessRendererHost(refs.preview);
		this.frame = null;
		this.proceduralOptions = normalizedProceduralOptions(preferences);
		this.proceduralPanel = new ProceduralOptionsPanel(refs.proceduralOptions, options => this.updateProcedural(options));
		this.controls = new ChessViewControls(refs, preferences, () => this.updateBase());
		this.transition = new ChessViewTransition(
			this.host,
			preferences,
			() => this.renderOptions(),
			(error, frame) => this.handleRenderFailure(error, frame)
		);
		this.proceduralPanel.render(this.proceduralOptions);
	}

	async render(frame = this.frame) {
		this.cancelTransition();
		this.frame = frame;
		if (!frame) return;
		try {
			await this.host.update(frame, { ...this.renderOptions(), motion: null, pose: null });
		} catch (error) {
			await this.handleRenderFailure(error, frame);
		}
	}

	async renderTransition(beforeFrame, afterFrame, durationMs) {
		this.frame = afterFrame;
		const animated = await this.transition.render(beforeFrame, afterFrame, durationMs);
		if (!animated && this.preferences.renderer !== "procedural3d") return this.render(afterFrame);
		if (!animated && this.preferences.renderer === "procedural3d") return this.render(afterFrame);
		return true;
	}

	cancelTransition() {
		this.transition.cancel();
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

	stats() {
		return this.host.stats();
	}

	async handleRenderFailure(error, frame) {
		if (this.preferences.renderer !== "procedural3d") throw error;
		this.preferences.renderer = "canvas25d";
		this.refs.mode.value = "canvas25d";
		savePreferences(this.preferences);
		this.refs.proceduralOptions.hidden = true;
		this.onStatus(`3D fallback: ${error.message}`);
		await this.host.update(frame, this.renderOptions());
	}

	updateBase() {
		savePreferences(this.preferences);
		this.render().catch(error => this.onStatus(error.message));
	}

	updateProcedural(options) {
		this.proceduralOptions = options;
		Object.assign(this.preferences, options);
		savePreferences(this.preferences);
		this.render().catch(error => this.onStatus(error.message));
	}

	dispose() {
		this.cancelTransition();
		this.controls.dispose();
		this.proceduralPanel.dispose();
		this.host.dispose();
	}
}
