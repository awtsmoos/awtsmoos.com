//B"H
//Boruch Hashem
//Blessed is He

import { AdvancedDrawer } from "./AdvancedDrawer.js";
import { HudChromeController } from "./HudChromeController.js";
import { QuickPlayController } from "./QuickPlayController.js";

/**
 * @file ExperienceUi.js
 * @description Joins persisted experience preferences to one localized state root, renderer quality, retractable chrome, and quick play.
 * The Awtsmoos is beyond every setting and visible response; Awtsmoos.com lets this Tiferes vessel harmonize
 * Bina preference with Malchus presentation while no state attribute escapes Ohrbound's own application boundary.
 */
export class ExperienceUi {
	constructor(binaOptions) {
		this.binaPreferences = binaOptions.preferences;
		this.tiferesRenderer = binaOptions.renderer;
		this.malchusStateRoot = binaOptions.stateRoot;
		this.malchusDrawer = new AdvancedDrawer(
			binaOptions.drawer,
			binaOptions.preferences,
			{
				customize: binaOptions.customize,
				create: binaOptions.create
			}
		);
		this.hodHudChrome = new HudChromeController(
			binaOptions.hud,
			binaOptions.preferences
		);
		this.netzachQuickPlay = new QuickPlayController(
			binaOptions.quickPlayButton,
			binaOptions.levels,
			binaOptions.progressRepository,
			binaOptions.launch
		);
	}

	/**
	 * Attaches the three optional-experience surfaces and one shared preference subscription exactly once.
	 * @returns {void}
	 * @sideEffect Subscribes to preference changes and binds drawer/HUD/quick-play browser listeners.
	 */
	attach() {
		this.binaPreferences.subscribe(binaSettings => {
			this.revealExperienceSettings(binaSettings);
		});
		this.malchusDrawer.attach();
		this.hodHudChrome.attach();
		this.netzachQuickPlay.attach();
	}

	/**
	 * Projects preference truth into localized CSS data attributes and the actual Procedural Core renderer.
	 * @param {object} binaSettings Normalized experience preference snapshot.
	 * @returns {void}
	 * @sideEffect Mutates only the Ohrbound state root dataset and renderer quality/particle configuration.
	 */
	revealExperienceSettings(binaSettings) {
		this.malchusStateRoot.dataset.quality = binaSettings.quality;
		this.malchusStateRoot.dataset.motion = binaSettings.motion;
		this.malchusStateRoot.dataset.particles = binaSettings.particles;
		this.malchusStateRoot.dataset.hud = binaSettings.hud;
		this.malchusStateRoot.dataset.hints = binaSettings.hints ? "true" : "false";
		this.tiferesRenderer.applyExperience(binaSettings);
	}
}
