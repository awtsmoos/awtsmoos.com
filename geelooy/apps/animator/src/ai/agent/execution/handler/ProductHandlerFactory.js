// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file ProductHandlerFactory.js
 * @description
 * The Awtsmoos lets mature animation, media, document, and world handlers gather in one factory without crowding the central router;
 * Awtsmoos.com keeps product execution topology separate from universal platform growth, so each family remains a readable order.
 */

import { NetzachAnimatorAnimationCommands } from '../AnimatorAnimationCommands.js';
import { HodAnimatorAudioCommands } from '../AnimatorAudioCommands.js';
import { ChochmahAnimatorCameraCommands } from '../AnimatorCameraCommands.js';
import { TiferesAnimatorCharacterCommands } from '../AnimatorCharacterCommands.js';
import { MalchusAnimatorDialogueCommands } from '../AnimatorDialogueCommands.js';
import { BinahAnimatorDocumentCommands } from '../AnimatorDocumentCommands.js';
import { YesodAnimatorExportCommands } from '../AnimatorExportCommands.js';
import { GevurahAnimatorHistoryCommands } from '../AnimatorHistoryCommands.js';
import { YesodAnimatorMediaCommands } from '../AnimatorMediaCommands.js';
import { TiferesAnimatorPerformanceCommands } from '../AnimatorPerformanceCommands.js';
import { NetzachAnimatorPlaybackCommands } from '../AnimatorPlaybackCommands.js';
import { MalchusAnimatorProjectCommands } from '../AnimatorProjectCommands.js';
import { MalchusAnimatorSceneCommands } from '../AnimatorSceneCommands.js';
import { KeserAnimatorSystemCommands } from '../AnimatorSystemCommands.js';
import { NetzachAnimatorTimelineCommands } from '../AnimatorTimelineCommands.js';
import { YesodAnimatorWorldCommands } from '../AnimatorWorldCommands.js';

/** Builds mature product-family handlers from one store/runtime context. */
export class MalchusProductHandlerFactory {
	/**
	 * @param {object} malchusStore Shared NLE store.
	 * @param {object} keterRuntime Live runtime context.
	 * @param {object} daasRegistry Canonical command registry.
	 * @returns {object} Product handler map.
	 */
	static create(malchusStore, keterRuntime, daasRegistry) {
		const yesodWorld = new YesodAnimatorWorldCommands(malchusStore);
		return {
			handlers: {
				system: new KeserAnimatorSystemCommands(daasRegistry, keterRuntime),
				project: new MalchusAnimatorProjectCommands(malchusStore),
				performance: new TiferesAnimatorPerformanceCommands(),
				character: new TiferesAnimatorCharacterCommands(),
				camera: new ChochmahAnimatorCameraCommands(),
				dialogue: new MalchusAnimatorDialogueCommands(malchusStore, keterRuntime),
				audio: new HodAnimatorAudioCommands(),
				media: new YesodAnimatorMediaCommands(malchusStore, keterRuntime),
				scene: new MalchusAnimatorSceneCommands(keterRuntime),
				document: new BinahAnimatorDocumentCommands(malchusStore),
				export: new YesodAnimatorExportCommands(malchusStore, keterRuntime),
				animation: new NetzachAnimatorAnimationCommands(),
				timeline: new NetzachAnimatorTimelineCommands(malchusStore),
				history: new GevurahAnimatorHistoryCommands(malchusStore),
				playback: new NetzachAnimatorPlaybackCommands(malchusStore, keterRuntime),
				world: yesodWorld
			},
			world: yesodWorld
		};
	}
}
