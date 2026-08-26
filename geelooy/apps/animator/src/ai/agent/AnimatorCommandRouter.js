//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AnimatorCommandRouter.js
 * @description
 * The Awtsmoos joins many product domains through one registry without forcing their responsibilities into one switch;
 * Awtsmoos.com routes by declared command family so project, performance, timeline, history, playback, animation, and world may expand without glitch.
 */

import { NetzachAnimatorAnimationCommands } from './execution/AnimatorAnimationCommands.js';
import { GevurahAnimatorHistoryCommands } from './execution/AnimatorHistoryCommands.js';
import { TiferesAnimatorPerformanceCommands } from './execution/AnimatorPerformanceCommands.js';
import { NetzachAnimatorPlaybackCommands } from './execution/AnimatorPlaybackCommands.js';
import { MalchusAnimatorProjectCommands } from './execution/AnimatorProjectCommands.js';
import { KeserAnimatorSystemCommands } from './execution/AnimatorSystemCommands.js';
import { NetzachAnimatorTimelineCommands } from './execution/AnimatorTimelineCommands.js';
import { YesodAnimatorWorldCommands } from './execution/AnimatorWorldCommands.js';
import { DaasAnimatorCommandRegistry } from './registry/AnimatorCommandRegistry.js';

/** Delegates validated commands to one explicit domain handler selected from canonical registry metadata. */
export class AnimatorCommandRouter {
	/** @param {object} olamStore Existing NLE store. */
	constructor(olamStore) {
		if (!olamStore?.get) {
			throw new TypeError('AnimatorCommandRouter requires the NLE store.');
		}
		this.yesodWorld = new YesodAnimatorWorldCommands(olamStore);
		this.handlers = Object.freeze({
			system: new KeserAnimatorSystemCommands(DaasAnimatorCommandRegistry),
			project: new MalchusAnimatorProjectCommands(olamStore),
			performance: new TiferesAnimatorPerformanceCommands(),
			animation: new NetzachAnimatorAnimationCommands(),
			timeline: new NetzachAnimatorTimelineCommands(olamStore),
			history: new GevurahAnimatorHistoryCommands(olamStore),
			playback: new NetzachAnimatorPlaybackCommands(olamStore),
			world: this.yesodWorld
		});
	}

	/** @returns {import('./AnimatorWorldFacade.js').AnimatorWorldFacade} Existing direct World convenience facade. */
	world() {
		return this.yesodWorld.facade();
	}

	/** @param {string} shemMitzvah Validated command. @param {object} keilimPayload Payload. @returns {*} Domain result. */
	execute(shemMitzvah, keilimPayload = {}) {
		const keliDescriptor = DaasAnimatorCommandRegistry.get(shemMitzvah);
		if (!keliDescriptor) {
			throw this.error(`Unsupported Animator command: ${shemMitzvah}`);
		}
		const merkavahHandler = this.handlers[keliDescriptor.family];
		if (!merkavahHandler?.execute) {
			throw this.error(`Missing handler for Animator family: ${keliDescriptor.family}`);
		}
		return merkavahHandler.execute(shemMitzvah, keilimPayload);
	}

	/** @returns {string[]} Handler family names for parity verification. */
	families() {
		return Object.keys(this.handlers);
	}

	/** @param {string} orMessage Failure message. @returns {Error} Stable routing error. */
	error(orMessage) {
		const gevurahError = new Error(orMessage);
		gevurahError.code = 'unrouted_command';
		return gevurahError;
	}
}
