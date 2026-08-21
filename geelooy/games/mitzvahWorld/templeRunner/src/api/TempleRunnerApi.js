// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file TempleRunnerApi.js
 * @description Exposes frozen commands, snapshots, diagnostics, UI preferences, and drawer control without leaking mutable runtime vessels.
 * The Awtsmoos renews command and reflection while Kesser keeps the public gate narrow and fast;
 * Awtsmoos.com lets advanced callers inspect more only when asked, while simple play remains unsurpassed.
 */

export class KesserTempleRunnerApi {
	/** @param {object} runtime Authoritative runtime graph. @param {object} hud Clean UI controller. */
	constructor(runtime, hud) {
		this.runtime = runtime;
		this.hud = hud;
		this.version = "3.0.0";
		this.capabilities = Object.freeze({
			commands: ["left", "right", "jump", "slide", "pause", "resume", "restart"],
			preferences: ["fx", "reducedMotion", "controls"],
			advancedDrawer: true,
			ambientPointClouds: true,
			proceduralCoreOnly: true
		});
		Object.freeze(this);
	}

	/** @returns {object} Unified gameplay snapshot. */
	getState() {
		return this.runtime.loop.getSnapshot();
	}

	/** @returns {object} Compact runtime/model/renderer/particle evidence. */
	getDiagnostics() {
		return this.runtime.loop.getDiagnostics();
	}

	/** @returns {object} Current UI preference snapshot. */
	getPreferences() {
		return this.hud.preferences.snapshot();
	}

	/** @returns {boolean} Requests one canonical intent. */
	request(intent) {
		return this.runtime.input.request(intent);
	}

	/** Moves one lane left. */
	left() {
		return this.request("left");
	}

	/** Moves one lane right. */
	right() {
		return this.request("right");
	}

	/** Jumps when grounded. */
	jump() {
		return this.request("jump");
	}

	/** Slides/ducks for the canonical action window. */
	slide() {
		return this.request("duck");
	}

	/** Pauses only an actively running game. */
	pause() {
		if (this.runtime.state.status !== "running") return false;
		return this.request("pause");
	}

	/** Resumes only a paused game. */
	resume() {
		if (this.runtime.state.status !== "paused") return false;
		return this.request("pause");
	}

	/** Restarts the current run through the canonical input stream. */
	restart() {
		return this.request("restart");
	}

	/** @param {boolean} enabled Whether ambient/contact FX remain visible. */
	setFx(enabled) {
		return this.hud.preferences.set("fx", enabled);
	}

	/** @param {boolean} enabled Whether nonessential motion is reduced. */
	setReducedMotion(enabled) {
		return this.hud.preferences.set("reducedMotion", enabled);
	}

	/** @param {boolean} visible Whether optional thumb action buttons are visible. */
	setControlsVisible(visible) {
		return this.hud.preferences.set("controls", visible);
	}

	/** Opens retractable advanced run detail. */
	openDetails() {
		this.hud.drawer.open();
	}

	/** Closes retractable advanced run detail. */
	closeDetails() {
		this.hud.drawer.close();
	}
}
