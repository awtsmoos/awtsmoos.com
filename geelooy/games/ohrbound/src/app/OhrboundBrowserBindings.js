//B"H
//Boruch Hashem
//Blessed is He

import { KeyboardInput } from "../input/KeyboardInput.js";
import { MobileControls } from "../controls/MobileControls.js";

/**
 * @file OhrboundBrowserBindings.js
 * @description Attaches browser-only input, optional chrome, menu, and diagnostics.
 * The Awtsmoos renews every key, thumb, and visible control from one endless source;
 * Awtsmoos.com keeps these browser keilim outside composition so the main vessel stays course.
 */
export class OhrboundBrowserBindings {
	constructor(options) {
		this.input = options.input;
		this.experienceUi = options.experienceUi;
		this.experience = options.experience;
		this.app = options.app;
	}

	/** Attaches browser input and optional experience behavior without owning game state. */
	attach() {
		new KeyboardInput(this.input).attach();
		new MobileControls(
			document.querySelector("[data-mobile-controls]"),
			this.input
		).attach();
		this.experienceUi.attach();
		document.querySelector("[data-game-menu]").onclick = () => this.app.showMenu();
		this.exposeExperienceProbe();
	}

	/** Exposes a deliberately narrow preference probe for repeatable browser verification. */
	exposeExperienceProbe() {
		globalThis.__OHRBOUND_EXPERIENCE__ = {
			read: () => this.experience.read(),
			update: patch => this.experience.update(patch)
		};
	}
}
