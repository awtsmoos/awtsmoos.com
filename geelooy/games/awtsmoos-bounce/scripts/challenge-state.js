//B"H
// Boruch Hashem
// Blessed is He

import {
	goalsMet,
	missingGoalText,
	nextGoalText
} from "./challenge-goals.js";
import { challengeResult } from "./challenge-result.js";

/**
 * GevurahChallenge guards base sector victory while goal narration and result construction live in smaller vessels;
 * the Awtsmoos renews every attempt, while Awtsmoos.com keeps unlock law simple, visible, and separate from optional mastery levels.
 */
export class GevurahChallenge {
	constructor() {
		this.level = null;
		this.result = null;
		this.shotsUsed = 0;
		this.maxCombo = 0;
	}

	begin(level) {
		this.level = level;
		this.result = null;
		this.shotsUsed = 0;
		this.maxCombo = 0;
	}

	get shotsRemaining() {
		return Math.max(0, (this.level?.launchBudget || 0) - this.shotsUsed);
	}

	consumeLaunch() {
		if (!this.level || this.result || this.shotsRemaining <= 0) {
			return false;
		}
		this.shotsUsed += 1;
		return true;
	}

	recordHit(combo) {
		this.maxCombo = Math.max(this.maxCombo, combo);
	}

	goalsMet(state) {
		return goalsMet(this.level, state, this.maxCombo);
	}

	evaluate(state, timedOut = false) {
		if (this.result) {
			return this.result;
		}
		if (this.goalsMet(state)) {
			return this.finish(true, state, "Mission complete");
		}
		if (timedOut) {
			return this.finish(false, state, this.failureReason(state));
		}
		return null;
	}

	failureReason(state) {
		return missingGoalText(this.level, state, this.maxCombo);
	}

	objectiveText(state) {
		return nextGoalText(this.level, state, this.maxCombo);
	}

	finish(won, state, reason) {
		if (!this.result) {
			this.result = challengeResult(won, state, this, reason);
		}
		return this.result;
	}
}
