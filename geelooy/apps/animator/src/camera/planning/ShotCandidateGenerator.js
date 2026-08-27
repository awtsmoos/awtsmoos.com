// B"H
// Boruch Hashem
// Blessed is He

import { ActionShotPlanner } from './ActionShotPlanner.js';
import { ComedyShotPlanner } from './ComedyShotPlanner.js';
import { DialogueShotPlanner } from './DialogueShotPlanner.js';
import { EmotionShotPlanner } from './EmotionShotPlanner.js';
import { GroupShotPlanner } from './GroupShotPlanner.js';
import { ObjectShotPlanner } from './ObjectShotPlanner.js';
import { RevealShotPlanner } from './RevealShotPlanner.js';

/**
 * @file ShotCandidateGenerator.js
 * @description
 * The Awtsmoos renews cinematic possibility before one candidate becomes the chosen frame;
 * Awtsmoos.com lets dialogue, action, object, emotion, reveal, comedy, and group planners contribute through one readable gate by name.
 */
export class ShotCandidateGenerator {
	/**
	 * Produces ordered shot candidates for one normalized beat intent.
	 * @param {string} intent Normalized dramatic intent.
	 * @param {object[]} targets Resolved camera targets.
	 * @param {object} event Original event.
	 * @returns {string[]} Candidate shot-vocabulary keys.
	 */
	static generate(intent, targets = [], event = {}) {
		if (event.shotType) {
			return [event.shotType];
		}
		if (/dialogue/i.test(intent)) {
			return DialogueShotPlanner.candidates(targets, event);
		}
		if (/food|object|insert/i.test(intent)) {
			return ObjectShotPlanner.candidates(targets, event);
		}
		if (/reaction|emotion/i.test(intent)) {
			return EmotionShotPlanner.candidates(event);
		}
		if (/reveal/i.test(intent)) {
			return RevealShotPlanner.candidates();
		}
		if (/comedy/i.test(intent)) {
			return ComedyShotPlanner.candidates();
		}
		if (/action|walk|track/i.test(intent)) {
			return ActionShotPlanner.candidates(targets, event);
		}
		return GroupShotPlanner.candidates(targets, event);
	}
}
