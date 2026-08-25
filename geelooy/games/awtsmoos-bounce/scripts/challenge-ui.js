//B"H
// Boruch Hashem
// Blessed is He

import { starGlyphs } from "./medals.js";
import { portalLegend } from "./portal-archetypes.js";

/**
 * HodChallengeView turns one sector into readable purpose, reward, replay, and forward campaign motion;
 * the Awtsmoos renews meaning each instant, while Awtsmoos.com keeps the visible mission clean and free of commotion.
 */
export class HodChallengeView {
	constructor(root = document) {
		this.overlay = root.querySelector("#startOverlay");
		this.title = root.querySelector("#gameTitle");
		this.subtitle = root.querySelector("#gameSubtitle");
		this.skill = root.querySelector("#skillValue");
		this.mission = root.querySelector("#missionValue");
		this.result = root.querySelector("#resultValue");
		this.legend = root.querySelector("#portalLegendValue");
		this.stars = root.querySelector("#starsValue");
		this.level = root.querySelector("#levelValue");
		this.goal = root.querySelector("#goalValue");
		this.hits = root.querySelector("#hitValue");
		this.shots = root.querySelector("#shotValue");
		this.objective = root.querySelector("#objectiveValue");
		this.progress = root.querySelector("#progressValue");
		this.start = root.querySelector("#startButton");
		this.continue = root.querySelector("#continueButton");
		this.previous = root.querySelector("#previousLevelButton");
		this.next = root.querySelector("#nextLevelButton");
	}

	update(campaign, state, challenge) {
		const snapshot = campaign.snapshot();
		const level = snapshot.level;
		const objective = challenge.objectiveText(state);
		this.level.textContent = `${level.order}/${snapshot.levelCount}`;
		this.goal.textContent = level.scoreGoal.toLocaleString();
		this.hits.textContent = `${state.hits}/${level.hitGoal}`;
		this.shots.textContent = `${challenge.shotsRemaining}`;
		this.objective.textContent = state.phase === "paused"
			? `Paused · ${objective}`
			: objective;
		this.progress.textContent = `Best ${snapshot.record.bestScore.toLocaleString()} · ${starGlyphs(snapshot.record.bestStars)} · ${snapshot.masteryCount}/6 mastery`;
	}

	showReady(campaign) {
		const snapshot = campaign.snapshot();
		const level = snapshot.level;
		this.title.textContent = level.title;
		this.subtitle.textContent = level.subtitle;
		this.skill.textContent = `SKILL · ${level.skill}`;
		this.mission.textContent = level.mission;
		this.result.textContent = `${level.launchBudget} launches · ${level.duration}s · elite ${level.goldScore.toLocaleString()}`;
		this.legend.textContent = portalLegend();
		this.stars.textContent = starGlyphs(snapshot.record.bestStars);
		this.start.textContent = "Begin sector";
		this.continue.hidden = true;
		this.overlay.classList.add("is-visible");
		this.syncNavigation(campaign);
	}

	showPlaying() {
		this.overlay.classList.remove("is-visible");
	}

	showResult(summary, campaign) {
		this.title.textContent = summary.won ? "Orbit secured." : "Covenant missed.";
		this.subtitle.textContent = summary.level.title;
		this.skill.textContent = summary.won
			? summary.reward
			: `SKILL · ${summary.level.skill}`;
		this.mission.textContent = summary.won
			? summary.reason
			: `Next run: ${summary.reason}`;
		this.result.textContent = `${summary.score.toLocaleString()} points · ${summary.hits} portals · chain ${summary.maxCombo} · ${summary.shotsRemaining} launches left`;
		this.legend.textContent = portalLegend();
		this.stars.textContent = starGlyphs(summary.stars);
		this.start.textContent = summary.won ? "Replay sector" : "Retry mission";
		this.continue.hidden = !(summary.won && summary.nextUnlocked && !summary.finalLevel);
		this.continue.textContent = summary.nextLevel
			? `Continue · ${summary.nextLevel.title}`
			: "Campaign complete";
		this.overlay.classList.add("is-visible");
		this.syncNavigation(campaign);
	}

	syncNavigation(campaign) {
		const snapshot = campaign.snapshot();
		this.previous.disabled = snapshot.selectedIndex <= 0;
		const nextLevel = campaign.levels[snapshot.selectedIndex + 1];
		this.next.disabled = !nextLevel || !campaign.progress.isUnlocked(nextLevel.order);
	}
}
