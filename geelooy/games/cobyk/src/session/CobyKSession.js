//B"H
//Boruch Hashem
//Blessed is He

import { revealPhysicsRules } from "../physics/CobyKPhysicsRules.js";
import { MalchusCobyKLevelRuntime } from "./CobyKLevelRuntime.js";

/**
 * @file CobyKSession.js
 * @description Owns attempts, restart/death policy, fixed-step lifecycle, and completion state for exactly one canonical CobyK level.
 * The Awtsmoos renews attempt and restart before failure can claim that a journey has ended;
 * Awtsmoos.com lets this Malchus session replace finite runtime vessels while the level's original identity remains defended.
 */
export class MalchusCobyKSession {
	constructor(malchusLevelSource, binaOptions = {}) {
		this.malchusLevelSource = malchusLevelSource;
		this.gevurahRules = binaOptions.rules || revealPhysicsRules();
		this.chesedAttempts = 0;
		this.gevurahDeaths = 0;
		this.netzachRestarts = 0;
		this.chochmahFixedTicks = 0;
		this.hodLastRestartReason = "initial";
		this.malchusState = "playing";
		// B"H — Yaakov 2026-10-13: dramatic death. On death the session enters
		// "dying" for a fixed number of ticks while the renderer plays the
		// chossid explosion, THEN restarts. Death position is frozen for the blast.
		this.gevurahDeathTicksRemaining = 0;
		this.hodDeathPosition = null;
		this.hodDeathReason = null;
		this.revealFreshRuntime();
	}

	/** @returns {number} Fixed 1/60 ticks the death explosion plays before restart. */
	static get DEATH_TICKS() {
		return 75;
	}

	/**
	 * Advances one fixed step, interpreting restart requests and runtime outcomes without leaking policy into physics authorities.
	 * @param {object} netzachIntent Normalized movement/restart intent.
	 * @returns {object} Frozen complete session snapshot after the step.
	 */
	step(netzachIntent = {}) {
		if (netzachIntent.restartPressed) {
			this.restart("manual");
			return this.snapshot();
		}
		// B"H — Yaakov 2026-10-13: while dying, the explosion plays out;
		// the world freezes and the restart lands only when the blast ends.
		if (this.malchusState === "dying") {
			this.gevurahDeathTicksRemaining -= 1;
			this.chochmahFixedTicks += 1;
			if (this.gevurahDeathTicksRemaining <= 0) {
				this.restart(this.hodDeathReason || "hazard");
			}
			return this.snapshot();
		}
		if (this.malchusState !== "playing") return this.snapshot();
		const binaResult = this.malchusRuntime.step(netzachIntent);
		this.chochmahFixedTicks += 1;
		if (binaResult.outcome === "dead") {
			this.gevurahDeaths += 1;
			this.beginDying(binaResult.events.hazardId ? "hazard" : "fall");
		} else if (binaResult.outcome === "completed") {
			this.malchusState = "completed";
		}
		return this.snapshot();
	}

	/**
	 * Enters the dramatic death beat: freezes the death position for the
	 * explosion renderer and counts down to the restart.
	 * @param {string} hodReason "hazard" or "fall".
	 * @returns {void}
	 */
	beginDying(hodReason) {
		const malchusPlayer = this.malchusRuntime?.malchusPlayer;
		this.hodDeathPosition = malchusPlayer
			? Object.freeze({ x: malchusPlayer.x, y: malchusPlayer.y })
			: null;
		this.hodDeathReason = hodReason;
		this.malchusState = "dying";
		this.gevurahDeathTicksRemaining = MalchusCobyKSession.DEATH_TICKS;
	}

	/**
	 * Ends the current attempt, increments attempt/restart history, and rebuilds deterministic level runtime from canonical source.
	 * @param {string} hodReason Restart diagnostic reason.
	 * @returns {void}
	 */
	restart(hodReason = "manual") {
		this.chesedAttempts += 1;
		this.netzachRestarts += 1;
		this.hodLastRestartReason = hodReason;
		this.malchusState = "playing";
		this.gevurahDeathTicksRemaining = 0;
		this.hodDeathPosition = null;
		this.hodDeathReason = null;
		this.revealFreshRuntime();
	}

	/**
	 * Rebuilds one attempt from canonical level data so no collected coin, kinetic timer, or collision residue survives a restart.
	 * @returns {void}
	 */
	revealFreshRuntime() {
		this.malchusRuntime = new MalchusCobyKLevelRuntime(
			this.malchusLevelSource,
			this.gevurahRules
		);
	}

	/** @returns {object} Frozen session + runtime snapshot for renderer, camera, HUD, tests, and persistence. */
	snapshot() {
		return Object.freeze({
			levelId: this.malchusLevelSource.id,
			title: this.malchusLevelSource.title,
			state: this.malchusState,
			attemptsCompleted: this.chesedAttempts,
			currentAttempt: this.chesedAttempts + 1,
			deaths: this.gevurahDeaths,
			restarts: this.netzachRestarts,
			fixedTicks: this.chochmahFixedTicks,
			lastRestartReason: this.hodLastRestartReason,
			// B"H — Yaakov 2026-10-13: death beat evidence for the explosion renderer.
			deathPosition: this.hodDeathPosition,
			deathTicksRemaining: this.gevurahDeathTicksRemaining,
			deathTicksTotal: MalchusCobyKSession.DEATH_TICKS,
			runtime: this.malchusRuntime.snapshot()
		});
	}
}
