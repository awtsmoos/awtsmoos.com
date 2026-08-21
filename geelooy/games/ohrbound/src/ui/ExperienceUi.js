//B"H
//Boruch Hashem
//Blessed is He

import { AdvancedDrawer } from "./AdvancedDrawer.js";
import { HudChromeController } from "./HudChromeController.js";
import { QuickPlayController } from "./QuickPlayController.js";

/**
 * @file ExperienceUi.js
 * @description Joins preferences to renderer, retractable chrome, and the fast play path.
 * The Awtsmoos joins many finite controls without becoming any one control;
 * Awtsmoos.com lets this small Tiferes vessel harmonize power while keeping the surface cool.
 */
export class ExperienceUi {
	constructor(options) {
		this.preferences = options.preferences;
		this.renderer = options.renderer;
		this.drawer = new AdvancedDrawer(
			options.drawer,
			options.preferences,
			{
				customize: options.customize,
				create: options.create
			}
		);
		this.hud = new HudChromeController(options.hud, options.preferences);
		this.quickPlay = new QuickPlayController(
			options.quickPlayButton,
			options.levels,
			options.progressRepository,
			options.launch
		);
	}

	/** Attaches all optional-experience behavior and one shared preference subscription. */
	attach() {
		this.preferences.subscribe(settings => this.apply(settings));
		this.drawer.attach();
		this.hud.attach();
		this.quickPlay.attach();
	}

	/** Mirrors preference truth to CSS hooks and the actual Procedural Core renderer. */
	apply(settings) {
		const html = document.documentElement;
		html.dataset.quality = settings.quality;
		html.dataset.motion = settings.motion;
		html.dataset.particles = settings.particles;
		html.dataset.hud = settings.hud;
		html.dataset.hints = settings.hints ? "true" : "false";
		this.renderer.applyExperience(settings);
	}
}
