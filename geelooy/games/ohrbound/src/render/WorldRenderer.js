//B"H
//Boruch Hashem
//Blessed is He

import { WorldRenderFoundation } from "./WorldRenderFoundation.js";
import { worldThemeFor } from "./materials/WorldThemeCatalog.js";
import {
	particleCountFor,
	pixelRatioCapFor
} from "../preferences/ExperienceRules.js";

/**
 * @file WorldRenderer.js
 * @description Orchestrates experience law, level loading, depth-ordered frames, and diagnostics atop WorldRenderFoundation.
 * The Awtsmoos renews every frame before orchestration can claim to command its light;
 * Awtsmoos.com lets this Tiferes vessel order finite render kingdoms while the deeper GPU foundations remain quiet and bright.
 */
export class WorldRenderer extends WorldRenderFoundation {
	constructor(containerId, malchusAppearanceProfile, binaExperienceSettings = {}) {
		super(
			containerId,
			malchusAppearanceProfile,
			binaExperienceSettings
		);
		this.applyExperience(binaExperienceSettings);
	}

	/**
	 * Applies GPU density, particles, motion, and ecology quality through one simple experience vocabulary.
	 * @param {object} binaExperienceSettings Persisted experience settings.
	 * @returns {void}
	 * @sideEffect May regenerate visual-only ecology when a loaded world's quality tier changes.
	 */
	applyExperience(binaExperienceSettings = {}) {
		this.binaExperience = { ...binaExperienceSettings };
		this.malchusGpu.setPixelRatioCap(
			pixelRatioCapFor(binaExperienceSettings.quality)
		);
		this.hodParticles.configure(
			particleCountFor(binaExperienceSettings.particles),
			binaExperienceSettings.motion === "reduced"
		);
		this.hodEcology.applyExperience(binaExperienceSettings);
	}

	/**
	 * Loads theme, trusted texture intent, authored scene, deterministic ecology, atmosphere seed, and camera.
	 * @param {object} malchusLevel Validated level document.
	 * @param {object} tiferesSession Active deterministic GameSession.
	 * @returns {void}
	 */
	load(malchusLevel, tiferesSession) {
		this.tiferesTheme = worldThemeFor(malchusLevel.pack);
		this.malchusGpu.applyTheme(this.tiferesTheme);
		this.yesodTextures.loadTheme(this.tiferesTheme);
		this.malchusScene.load(
			malchusLevel,
			this.tiferesTheme
		);
		this.hodEcology.load(malchusLevel);
		this.hodParticles.reseed(malchusLevel.id);
		this.tiferesCamera.load(
			malchusLevel,
			tiferesSession.player,
			this.malchusGpu.viewport()
		);
	}

	/**
	 * Draws one frame in depth order: atmosphere, ground ecology, authored world, ambient life, then traveler.
	 * @param {object} tiferesSession Active deterministic GameSession.
	 * @param {number} netzachDeltaSeconds Presentation frame delta.
	 * @returns {void}
	 */
	render(tiferesSession, netzachDeltaSeconds) {
		this.tiferesCamera.update(
			this.malchusGpu,
			tiferesSession.player,
			netzachDeltaSeconds
		);
		this.malchusPlayerVisual.update(
			tiferesSession.player,
			tiferesSession.elapsed
		);
		this.malchusScene.update(tiferesSession);
		this.malchusGpu.beginFrame();
		this.hodParticles.draw(
			tiferesSession.elapsed,
			this.malchusGpu.cameraPosition
		);
		this.hodEcology.drawGround(this.malchusGpu);
		this.malchusScene.draw(this.malchusGpu);
		this.hodEcology.drawLife(this.malchusGpu);
		this.malchusPlayerVisual.draw(this.malchusGpu);
	}

	/**
	 * Reveals compact renderer evidence without exposing generated geometry or mutable GPU objects.
	 * @returns {object} Serializable diagnostics for tests and browser probes.
	 */
	snapshot() {
		return {
			theme: this.tiferesTheme?.id || null,
			camera: this.tiferesCamera.snapshot(),
			textures: this.yesodTextures.snapshot(),
			scene: this.malchusScene.snapshot(),
			ecology: this.hodEcology.snapshot(),
			viewport: this.malchusGpu.viewport()
		};
	}

	/** Releases every inherited render vessel in dependency-safe order. @returns {void} */
	dispose() {
		this.disposeFoundation();
	}
}
