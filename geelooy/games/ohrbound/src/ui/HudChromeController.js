//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file HudChromeController.js
 * @description Lets the gameplay HUD retract after attention returns to the world.
 * The Awtsmoos is fully present whether a finite label is shown or concealed;
 * Awtsmoos.com lets chrome withdraw gently so the gate itself may be revealed.
 */
export class HudChromeController {
	constructor(hud, preferences) {
		this.hud = hud;
		this.preferences = preferences;
		this.settings = preferences.read();
		this.timer = null;
	}

	/** Attaches preference, input, and page-mode observers for adaptive compaction. */
	attach() {
		this.preferences.subscribe(settings => {
			this.settings = settings;
			this.reveal();
		});
		document.addEventListener("pointerdown", () => this.reveal(), { passive: true });
		document.addEventListener("keydown", event => {
			if (!event.repeat) this.reveal();
		});
		new MutationObserver(() => this.reveal()).observe(document.body, {
			attributes: true,
			attributeFilter: ["data-mode"]
		});
		this.reveal();
	}

	/** Expands useful context immediately and schedules calm adaptive retraction. */
	reveal() {
		clearTimeout(this.timer);
		this.hud.dataset.compact = "false";
		if (!this.shouldCompact()) return;
		this.timer = setTimeout(() => {
			if (this.shouldCompact()) this.hud.dataset.compact = "true";
		}, 2400);
	}

	/** Returns whether the current mode and preference permit automatic retraction. */
	shouldCompact() {
		return document.body.dataset.mode === "game" && this.settings.hud === "adaptive";
	}
}
