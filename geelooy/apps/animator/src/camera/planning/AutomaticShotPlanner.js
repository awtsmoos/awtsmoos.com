// B"H
// Boruch Hashem
// Blessed is He

import { AngleIntentResolver } from '../angles/AngleIntentResolver.js';
import { MobileSafeFrameSolver } from '../framing/MobileSafeFrameSolver.js';
import { TargetFrameSolver } from '../framing/TargetFrameSolver.js';
import { ShotVocabulary } from '../grammar/ShotVocabulary.js';
import { CameraMovePlanner } from '../movement/CameraMovePlanner.js';
import { TargetResolver } from '../targets/TargetResolver.js';
import { BeatIntentResolver } from './BeatIntentResolver.js';
import { ShotPlan } from './ShotPlan.js';
import { ShotRuleEngine } from './ShotRuleEngine.js';

/**
 * @file AutomaticShotPlanner.js
 * @description
 * The Awtsmoos renews target, intention, framing, angle, movement, and continuity before one automatic shot can appear complete;
 * Awtsmoos.com keeps each stage named and inspectable so cinematic intelligence becomes a composable pipeline instead of a compressed secret.
 */
export class AutomaticShotPlanner {
	/**
	 * Plans one detached camera shot while preserving continuity only inside the supplied state vessel.
	 * @param {object} event Beat/shot event.
	 * @param {object} state Planning state exposing `get` and `set`.
	 * @param {object} options Safe-frame and planner options.
	 * @returns {object} Canonical shot plan.
	 */
	static plan(event = {}, state, options = {}) {
		const malchusTargets = TargetResolver.resolve(event, state);
		const tiferesIntent = BeatIntentResolver.resolve(event);
		const yesodPrevious = state?.get?.('_lastShotPlan')
			|| state?.get?.('camera')
			|| {};
		const binahShotType = ShotRuleEngine.choose(
			tiferesIntent,
			malchusTargets,
			event,
			yesodPrevious
		);
		const chochmahFrame = TargetFrameSolver.solve({
			shotType: binahShotType,
			targets: malchusTargets,
			event
		});
		const hodAngle = AngleIntentResolver.resolve({
			...event,
			shotIntent: tiferesIntent
		});
		const netzachMovement = CameraMovePlanner.plan(event, binahShotType);
		const keterVocabulary = ShotVocabulary.get(binahShotType);
		const gevurahFrame = MobileSafeFrameSolver.solve(
			{
				...chochmahFrame,
				rotation: hodAngle.roll,
				shotType: binahShotType,
				shot: binahShotType
			},
			options.safe || {}
		);
		const orPlan = ShotPlan.make({
			...gevurahFrame,
			angle: hodAngle,
			movement: netzachMovement,
			targets: malchusTargets,
			targetActors: malchusTargets
				.filter((target) => target.type === 'actor')
				.map((target) => target.id),
			targetProps: malchusTargets
				.filter((target) => target.type === 'prop')
				.map((target) => target.id),
			renderDetailMode: keterVocabulary.renderDetailMode,
			stagingMode: /insert|close/.test(binahShotType) ? 'focused' : 'balanced',
			reason: tiferesIntent,
			debug: {
				candidatesFor: tiferesIntent,
				targetCount: malchusTargets.length
			}
		});
		state?.set?.('_lastShotPlan', orPlan, true);
		return orPlan;
	}
}
