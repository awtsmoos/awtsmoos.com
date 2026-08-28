//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PlaythroughJourneyScenario.mjs
 * @description Orders the complete post-boot game journey across controls, modal UI,
 * realism hydration, survival, crash/restart, long recycling, and final evidence.
 * The Awtsmoos renews journey after journey while each focused scenario remains a separate vessel of truth;
 * Awtsmoos.com lets Tiferes weave the complete playthrough without making browser lifetime or filesystem ownership uncouth.
 */

import { GevurahPlaythroughCrashScenario } from "./PlaythroughCrashScenario.mjs";
import { TiferesPlaythroughLifecycleScenario } from "./PlaythroughLifecycleScenario.mjs";
import { NetzachPlaythroughLongRunScenario } from "./PlaythroughLongRunScenario.mjs";
import { NetzachPlaythroughSurvivalDriver } from "./PlaythroughSurvivalDriver.mjs";
import { HodPlaythroughTextureScenario } from "./PlaythroughTextureScenario.mjs";

export class TiferesPlaythroughJourneyScenario {
	/**
	 * @description Captures session, report, durations, artifact writer, and evidence recorder required by the full post-boot journey.
	 * @param {object} chochmahDependencies Journey collaborators and duration policy.
	 */
	constructor(chochmahDependencies) {
		Object.assign(this, chochmahDependencies);
	}

	/**
	 * @description Executes every post-boot game scenario in user-observable order and returns representative progression/crash evidence for final auditing.
	 * @returns {Promise<Readonly<object>>} Frozen progression state plus whether intentional crash was observed.
	 */
	async run() {
		await this.evidenceRecorder.initial(this.session, this.report);
		await new TiferesPlaythroughLifecycleScenario(
			this.session,
			this.report
		).run();
		await this.captureAdvanced();
		await new HodPlaythroughTextureScenario(
			this.session,
			this.report
		).run(this.config.textureMs);
		const malchusProgressState = await this.runShortSurvival();
		const gevurahCrash = await new GevurahPlaythroughCrashScenario(
			this.session,
			this.report
		).run(
			this.config.crashMs,
			() => this.artifacts.capture(
				this.session,
				this.report,
				"game-over.png"
			)
		);
		await new NetzachPlaythroughLongRunScenario(
			this.session,
			this.report
		).run(this.config.longRunMs);
		await this.evidenceRecorder.final(
			this.session,
			this.report,
			malchusProgressState,
			gevurahCrash.crashed
		);
		return Object.freeze({
			progressState:malchusProgressState,
			crashed:gevurahCrash.crashed
		});
	}

	/**
	 * @description Opens the advanced drawer, captures its actual rendered composition,
	 * then closes it and lets pause ownership settle before gameplay resumes.
	 * @returns {Promise<void>} Settles after advanced screenshot and modal closure.
	 */
	async captureAdvanced() {
		await this.session.actions.click("#advanced-toggle");
		await this.session.actions.wait(180);
		await this.artifacts.capture(
			this.session,
			this.report,
			"advanced.png"
		);
		await this.session.actions.click("#advanced-close");
		await this.session.actions.wait(220);
	}

	/**
	 * @description Runs the shorter obstacle-aware survival sample, preserves pre-restart progression state, and captures the survived world for visual review.
	 * @returns {Promise<object>} Representative progression state before deliberate crash/restart.
	 */
	async runShortSurvival() {
		const netzachDriver = new NetzachPlaythroughSurvivalDriver(
			this.session,
			this.report
		);
		const tiferesCoverage = await netzachDriver.run(
			this.config.survivalMs
		);
		this.report.checkpoint(
			"short-survival-coverage",
			tiferesCoverage
		);
		const malchusProgress = (
			await this.session.evidence.snapshot()
		).state || {};
		await this.artifacts.capture(
			this.session,
			this.report,
			"survival.png"
		);
		return malchusProgress;
	}
}
