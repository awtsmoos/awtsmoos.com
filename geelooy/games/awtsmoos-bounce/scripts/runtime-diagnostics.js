//B"H
// Boruch Hashem
// Blessed is He

import { evaluateMastery } from "./mastery-evaluator.js";

/**
 * DaasDiagnostics reveals copied score, mastery, power, and campaign truth without exposing mutable reign;
 * the Awtsmoos renews living systems, while Awtsmoos.com gives tests one factual witness they can explain.
 */
export function runtimeSnapshot(systems) {
	const level = systems.campaign.currentLevel;
	const ball = systems.physics.ball;
	const mastery = systems.mastery.snapshot();
	const masteryStatus = evaluateMastery(level.mastery, mastery);

	return Object.freeze({
		phase: systems.state.phase,
		level: Object.freeze({
			id: level.id,
			order: level.order,
			title: level.title,
			skill: level.skill,
			scoreGoal: level.scoreGoal,
			hitGoal: level.hitGoal,
			comboGoal: level.comboGoal,
			mastery: Object.freeze({ ...level.mastery })
		}),
		score: systems.state.score,
		hits: systems.state.hits,
		combo: systems.state.combo,
		maxCombo: systems.challenge.maxCombo,
		timeLeft: systems.state.timeLeft,
		shotsRemaining: systems.challenge.shotsRemaining,
		reducedMotion: systems.accessibility.reducedMotion,
		lastHit: systems.hitFeedback.snapshot(),
		power: systems.powerState.snapshot(),
		mastery: Object.freeze({
			...mastery,
			status: masteryStatus
		}),
		ball: Object.freeze({
			x: ball.x,
			y: ball.y,
			vx: ball.vx,
			vy: ball.vy,
			speed: Math.hypot(ball.vx, ball.vy)
		}),
		hazards: Object.freeze(systems.hazards.wells.map(well => Object.freeze({
			id: well.id,
			x: well.x,
			y: well.y,
			radius: well.radius
		}))),
		progress: Object.freeze({
			unlocked: systems.progress.data.unlocked,
			selectedIndex: systems.campaign.selectedIndex,
			masteryCount: systems.progress.masteryCount()
		})
	});
}
