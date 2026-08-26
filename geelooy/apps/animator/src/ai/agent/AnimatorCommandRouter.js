//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AnimatorCommandRouter.js
 * @description
 * The Awtsmoos joins many product domains through one registry while each handler keeps its appointed vessel and runtime need;
 * Awtsmoos.com routes by declared family so character, camera, dialogue, sound, media, timeline, transport, and world may grow without greed.
 */

import { NetzachAnimatorAnimationCommands } from './execution/AnimatorAnimationCommands.js';
import { HodAnimatorAudioCommands } from './execution/AnimatorAudioCommands.js';
import { ChochmahAnimatorCameraCommands } from './execution/AnimatorCameraCommands.js';
import { TiferesAnimatorCharacterCommands } from './execution/AnimatorCharacterCommands.js';
import { MalchusAnimatorDialogueCommands } from './execution/AnimatorDialogueCommands.js';
import { GevurahAnimatorHistoryCommands } from './execution/AnimatorHistoryCommands.js';
import { YesodAnimatorMediaCommands } from './execution/AnimatorMediaCommands.js';
import { TiferesAnimatorPerformanceCommands } from './execution/AnimatorPerformanceCommands.js';
import { NetzachAnimatorPlaybackCommands } from './execution/AnimatorPlaybackCommands.js';
import { MalchusAnimatorProjectCommands } from './execution/AnimatorProjectCommands.js';
import { KeserAnimatorSystemCommands } from './execution/AnimatorSystemCommands.js';
import { NetzachAnimatorTimelineCommands } from './execution/AnimatorTimelineCommands.js';
import { YesodAnimatorWorldCommands } from './execution/AnimatorWorldCommands.js';
import { DaasAnimatorCommandRegistry } from './registry/AnimatorCommandRegistry.js';

/** Delegates validated commands to explicit domain handlers selected from canonical registry metadata. */
export class AnimatorCommandRouter {
	/** @param {object} malchusStore NLE store. @param {object} keterRuntime Optional live runtime context. */
	constructor(malchusStore, keterRuntime = {}) {
		if (!malchusStore?.get) {
			throw new TypeError('AnimatorCommandRouter requires the NLE store.');
		}
		this.yesodWorld = new YesodAnimatorWorldCommands(malchusStore);
		this.handlers = Object.freeze({
			system: new KeserAnimatorSystemCommands(DaasAnimatorCommandRegistry, keterRuntime),
			project: new MalchusAnimatorProjectCommands(malchusStore),
			performance: new TiferesAnimatorPerformanceCommands(),
			character: new TiferesAnimatorCharacterCommands(),
			camera: new ChochmahAnimatorCameraCommands(),
			dialogue: new MalchusAnimatorDialogueCommands(malchusStore, keterRuntime),
			audio: new HodAnimatorAudioCommands(),
			media: new YesodAnimatorMediaCommands(malchusStore, keterRuntime),
			animation: new NetzachAnimatorAnimationCommands(),
			timeline: new NetzachAnimatorTimelineCommands(malchusStore),
			history: new GevurahAnimatorHistoryCommands(malchusStore),
			playback: new NetzachAnimatorPlaybackCommands(malchusStore, keterRuntime),
			world: this.yesodWorld
		});
	}

	/** @returns {import('./AnimatorWorldFacade.js').AnimatorWorldFacade} Existing direct World facade. */
	world() {
		return this.yesodWorld.facade();
	}

	/** @param {string} shemMitzvah Command. @param {object} keilimPayload Payload. @returns {*} Domain result. */
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
