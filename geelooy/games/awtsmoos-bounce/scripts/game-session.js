//B"H
// Boruch Hashem
// Blessed is He

import { YesodRound } from "./round.js";
import { TiferesGameView } from "./game-view.js";
import { resetSessionSystems } from "./session-reset.js";

/**
 * MalchusSession holds one sector while reset, mastery, reward, haptics, and continuation cross honest boundaries;
 * the Awtsmoos renews each attempt, and Awtsmoos.com lets victory open the next doorway without skipping its grounds.
 */
export class MalchusSession {
	constructor(systems) {
		this.systems = systems;
		this.elapsed = 0;
		this.bounds = systems.viewport.resize();
		this.round = new YesodRound(systems, result => this.finishLevel(result));
		this.view = new TiferesGameView(systems);
		this.prepareLevel();
		systems.input.setKeyboardAimProvider(
			() => systems.targets.nearestTo(systems.physics.ball)
		);
	}

	prepareLevel() {
		const { campaign, challengeView, masteryView } = this.systems;
		const level = campaign.currentLevel;
		resetSessionSystems(this.systems, level, this.bounds, false);
		challengeView.showReady(campaign);
		masteryView.showReady(level, campaign.currentRecord);
		this.render();
	}

	startLevel() {
		const { campaign, sound, challengeView } = this.systems;
		const level = campaign.currentLevel;
		resetSessionSystems(this.systems, level, this.bounds, true);
		this.round.begin();
		this.elapsed = 0;
		sound.unlock();
		challengeView.showPlaying();
		this.render();
	}

	selectLevel(delta) {
		const { state, campaign } = this.systems;
		if (state.phase === "playing" || state.phase === "paused") {
			return campaign.currentLevel;
		}
		campaign.select(delta);
		this.prepareLevel();
		return campaign.currentLevel;
	}

	continueLevel() {
		const { campaign } = this.systems;
		const before = campaign.selectedIndex;
		campaign.select(1);
		if (campaign.selectedIndex === before) {
			return false;
		}
		this.prepareLevel();
		return true;
	}

	finishLevel(result) {
		const {
			campaign,
			challenge,
			mastery,
			state,
			settings,
			storage,
			sound,
			haptics,
			challengeView,
			masteryView,
			ui
		} = this.systems;
		storage.writeNumber(settings.bestScoreKey, state.bestScore);
		const summary = campaign.complete(state, challenge, mastery);
		const starWord = summary.stars === 1 ? "star" : "stars";
		sound.finish();
		if (summary.won) {
			summary.mastery.completed ? haptics.mastery() : haptics.victory();
		}
		challengeView.showResult(summary, campaign);
		masteryView.showResult(summary);
		ui.announce(summary.won
			? `Sector complete. ${summary.stars} ${starWord}. ${summary.mastery.completed ? "Mastery secured." : "Mastery remains."}`
			: `Mission failed. ${result.reason}`
		);
	}

	resize() {
		const { viewport, physics, targets, hazards, campaign } = this.systems;
		this.bounds = viewport.resize();
		viewport.clampBall(physics.ball);
		targets.reset(this.bounds, physics.ball);
		hazards.reset(campaign.currentLevel, this.bounds);
		this.render();
	}

	advance(deltaSeconds) {
		this.elapsed += deltaSeconds;
		this.round.advance(deltaSeconds, this.bounds);
	}

	render() {
		this.view.render(this.bounds, this.elapsed);
	}
}
