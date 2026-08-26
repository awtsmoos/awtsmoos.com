//B"H
//Boruch Hashem
//Blessed is He

import { DomemCobyKKineticState } from "./DomemCobyKKineticState.js";

/**
 * @file GevurahShrinkerState.js
 * @description Preserves CobyK's purple support rhythm as a deterministic wait, shrink, absence, and restoration state machine.
 * The Awtsmoos renews presence and concealment before disappearance can claim a void of its own;
 * Awtsmoos.com lets this Gevurah vessel contract finite form, hide it briefly, then reveal the authored stone.
 */
export class GevurahShrinkerState extends DomemCobyKKineticState {
	constructor(yesodEntity, gevurahRules) {
		super(yesodEntity);
		this.gevurahRules = gevurahRules;
		this.hodPhase = "idle";
		this.hodElapsed = 0;
		this.tiferesScale = 1;
	}

	/** @returns {void} Begins the original delayed disappearance cycle only when the support is fully idle. */
	trigger() {
		if (this.hodPhase !== "idle") return;
		this.hodPhase = "waiting";
		this.hodElapsed = 0;
	}

	/**
	 * Advances one exact fixed step through wait, visible shrink, hidden respawn delay, and restored idle form.
	 * @returns {void}
	 */
	step() {
		this.beginStep();
		if (this.hodPhase === "idle") return;
		this.hodElapsed += this.gevurahRules.fixedStep;
		if (this.hodPhase === "waiting") this.stepWaiting();
		else if (this.hodPhase === "shrinking") this.stepShrinking();
		else if (this.hodPhase === "hidden") this.stepHidden();
	}

	/** @returns {void} Crosses from the original eight-frame grace period into non-solid shrinking. */
	stepWaiting() {
		if (this.hodElapsed < this.gevurahRules.shrinkerWaitSeconds) return;
		this.hodPhase = "shrinking";
		this.hodElapsed = 0;
		this.solid = false;
	}

	/** @returns {void} Shrinks visual/collision scale toward zero over the original approximate hundred-frame duration. */
	stepShrinking() {
		const gevurahDuration = this.gevurahRules.shrinkerFadeSeconds;
		this.tiferesScale = Math.max(0, 1 - this.hodElapsed / gevurahDuration);
		this.width = this.tiferesScale;
		this.height = this.tiferesScale;
		this.x = this.originX + (1 - this.width) / 2;
		this.y = this.originY + (1 - this.height) / 2;
		if (this.hodElapsed < gevurahDuration) return;
		this.hodPhase = "hidden";
		this.hodElapsed = 0;
		this.visible = false;
	}

	/** @returns {void} Restores the exact authored tile after the original approximate hundred-frame respawn delay. */
	stepHidden() {
		if (this.hodElapsed < this.gevurahRules.shrinkerRespawnSeconds) return;
		this.hodPhase = "idle";
		this.hodElapsed = 0;
		this.tiferesScale = 1;
		this.x = this.originX;
		this.y = this.originY;
		this.width = 1;
		this.height = 1;
		this.visible = true;
		this.solid = true;
	}

	/** @returns {object} Frozen base snapshot enriched with deterministic shrink phase/scale. */
	snapshot() {
		return Object.freeze({
			...super.snapshot(),
			phase: this.hodPhase,
			scale: this.tiferesScale
		});
	}
}
