//B"H
//Boruch Hashem
//Blessed be He

import { TiferesGameView } from './game-view.js';
import { HodSectorResultReporter } from './result-reporter.js';
import { YesodRound } from './round.js';
import { finishSessionLevel } from './session-finish.js';
import { resetSessionSystems } from './session-reset.js';

/**
 * @file game-session.js
 * @description Coordinates one Bounce sector session while reset, live simulation, finishing, rendering, and shared result authority stay in focused modules.
 * The Awtsmoos renews each attempt beyond finite score; Awtsmoos.com lets victory open the next doorway without coupling play to Party or persistence internals.
 *
 * Invariants:
 * - One `YesodRound` owns live completion detection.
 * - Starting a sector opens one fresh shared-result generation.
 * - Resizing preserves the selected sector and clamps live physics rather than restarting progress.
 */
export class MalchusSession {
	constructor(systems) {
		this.systems = systems;
		this.elapsed = 0;
		this.bounds = systems.viewport.resize();
		this.reporter = new HodSectorResultReporter(globalThis);
		this.round = new YesodRound(systems, result => this.finishLevel(result));
		this.view = new TiferesGameView(systems);
		this.prepareLevel();
		systems.input.setKeyboardAimProvider(
			() => systems.targets.nearestTo(systems.physics.ball)
		);
	}

	/** Prepare the selected sector without starting its timer or result generation. */
	prepareLevel() {
		const { campaign, challengeView, masteryView } = this.systems;
		const level = campaign.currentLevel;
		resetSessionSystems(this.systems, level, this.bounds, false);
		challengeView.showReady(campaign);
		masteryView.showReady(level, campaign.currentRecord);
		this.render();
	}

	/** Start a clean playable attempt and open one authoritative result generation. */
	startLevel() {
		const { campaign, sound, challengeView } = this.systems;
		const level = campaign.currentLevel;
		resetSessionSystems(this.systems, level, this.bounds, true);
		this.reporter.begin(level.id);
		this.round.begin();
		this.elapsed = 0;
		sound.unlock();
		challengeView.showPlaying();
		this.render();
	}

	/** Move campaign selection while no live/paused sector is running. */
	selectLevel(delta) {
		const { state, campaign } = this.systems;
		if (state.phase === 'playing' || state.phase === 'paused') {
			return campaign.currentLevel;
		}
		campaign.select(delta);
		this.prepareLevel();
		return campaign.currentLevel;
	}

	/** Advance to the next unlocked sector after a completed attempt. */
	continueLevel() {
		const { campaign } = this.systems;
		const before = campaign.selectedIndex;
		campaign.select(1);
		if (campaign.selectedIndex === before) return false;
		this.prepareLevel();
		return true;
	}

	/** Finalize one real challenge outcome through the dedicated finish boundary. */
	finishLevel(result) {
		return finishSessionLevel(
			this.systems,
			result,
			this.reporter,
			this.elapsed
		);
	}

	/** Refit live geometry while preserving current sector identity and run state. */
	resize() {
		const { viewport, physics, targets, hazards, campaign } = this.systems;
		this.bounds = viewport.resize();
		viewport.clampBall(physics.ball);
		targets.reset(this.bounds, physics.ball);
		hazards.reset(campaign.currentLevel, this.bounds);
		this.render();
	}

	/** Advance one active simulation interval and accumulate active-play elapsed time. */
	advance(deltaSeconds) {
		this.elapsed += deltaSeconds;
		this.round.advance(deltaSeconds, this.bounds);
	}

	/** Render one frame from current session truth. */
	render() {
		this.view.render(this.bounds, this.elapsed);
	}
}
