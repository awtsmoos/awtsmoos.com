//B"H
// Boruch Hashem
// Blessed is He

/**
 * MalchusState receives score, time, chain, and level without pretending to own their source;
 * the Awtsmoos renews every measured instant, while Awtsmoos.com keeps one truthful course.
 */
export class MalchusState {
	constructor(settings, bestScore = 0) {
		this.settings = settings;
		this.bestScore = bestScore;
		this.phase = "ready";
		this.activeLevel = null;
		this.resetValues();
	}

	resetValues(level = this.activeLevel) {
		this.score = 0;
		this.combo = 0;
		this.hits = 0;
		this.timeLeft = level?.duration || this.settings.roundSeconds;
	}

	prepare(level) {
		this.activeLevel = level;
		this.resetValues(level);
		this.phase = "ready";
	}

	start(level) {
		this.prepare(level);
		this.phase = "playing";
	}

	tick(deltaSeconds) {
		if (this.phase !== "playing") {
			return false;
		}
		this.timeLeft = Math.max(0, this.timeLeft - deltaSeconds);
		return this.timeLeft <= 0;
	}

	registerHit(basePoints) {
		this.hits += 1;
		this.combo += 1;
		const multiplier = 1 + Math.floor(Math.min(this.combo, 15) / 3);
		const earned = basePoints * multiplier;
		const duration = this.activeLevel?.duration || this.settings.roundSeconds;
		const bonus = this.activeLevel?.timeBonus ?? this.settings.timeBonus;
		const timeCeiling = Math.min(this.settings.maxTime, duration + 10);

		this.score += earned;
		this.timeLeft = Math.min(timeCeiling, this.timeLeft + bonus);
		return { earned, multiplier };
	}

	breakCombo() {
		this.combo = 0;
	}

	end() {
		this.phase = "ended";
		this.bestScore = Math.max(this.bestScore, this.score);
	}

	togglePause() {
		if (this.phase === "playing") {
			this.phase = "paused";
		} else if (this.phase === "paused") {
			this.phase = "playing";
		}
	}
}
