// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AnimatorFacadeInstaller.js
 * @description
 * The Awtsmoos gathers ergonomic product and platform doorways around one canonical execution center without crowding their names together;
 * Awtsmoos.com keeps the root API small while every mature and universal family receives one explicit JavaScript namespace to discover.
 */

import { NetzachAnimatorAnimationFacade } from './AnimatorAnimationFacade.js';
import { HodAnimatorAudioFacade } from './AnimatorAudioFacade.js';
import { ChochmahAnimatorCameraFacade } from './AnimatorCameraFacade.js';
import { TiferesAnimatorCharacterFacade } from './AnimatorCharacterFacade.js';
import { MalchusAnimatorDialogueFacade } from './AnimatorDialogueFacade.js';
import { BinahAnimatorDocumentFacade } from './AnimatorDocumentFacade.js';
import { HodAnimatorEventFacade } from './AnimatorEventFacade.js';
import { YesodAnimatorExportFacade } from './AnimatorExportFacade.js';
import { GevurahAnimatorGpuFacade } from './AnimatorGpuFacade.js';
import { GevurahAnimatorHistoryFacade } from './AnimatorHistoryFacade.js';
import { YesodAnimatorMediaFacade } from './AnimatorMediaFacade.js';
import { KeterAnimatorObjectFacade } from './AnimatorObjectFacade.js';
import { TiferesAnimatorPerformanceFacade } from './AnimatorPerformanceFacade.js';
import { NetzachAnimatorPlaybackFacade } from './AnimatorPlaybackFacade.js';
import { GevurahAnimatorPreflightFacade } from './AnimatorPreflightFacade.js';
import { MalchusAnimatorProjectFacade } from './AnimatorProjectFacade.js';
import { TiferesAnimatorRenderFacade } from './AnimatorRenderFacade.js';
import { MalchusAnimatorSceneFacade } from './AnimatorSceneFacade.js';
import { DaasAnimatorSchemaFacade } from './AnimatorSchemaFacade.js';
import { KeserAnimatorSystemFacade } from './AnimatorSystemFacade.js';
import { YesodAnimatorTextureFacade } from './AnimatorTextureFacade.js';
import { NetzachAnimatorTimelineFacade } from './AnimatorTimelineFacade.js';
import { MalchusAnimatorTransactionFacade } from './AnimatorTransactionFacade.js';

/** Installs typed convenience namespaces around one canonical AnimatorAgentApi. */
export class MalchusAnimatorFacadeInstaller {
	/** @param {object} keterApi API. @param {object} merkavahRouter Router. */
	static install(keterApi, merkavahRouter) {
		keterApi.world = merkavahRouter.world();
		for (const [shemProperty, Facade] of this.entries()) {
			keterApi[shemProperty] = new Facade(keterApi);
		}
	}

	/** @returns {Array<[string, Function]>} Explicit public facade-property topology. */
	static entries() {
		return [
			['system', KeserAnimatorSystemFacade],
			['project', MalchusAnimatorProjectFacade],
			['performance', TiferesAnimatorPerformanceFacade],
			['character', TiferesAnimatorCharacterFacade],
			['camera', ChochmahAnimatorCameraFacade],
			['dialogue', MalchusAnimatorDialogueFacade],
			['audio', HodAnimatorAudioFacade],
			['media', YesodAnimatorMediaFacade],
			['scene', MalchusAnimatorSceneFacade],
			['document', BinahAnimatorDocumentFacade],
			['export', YesodAnimatorExportFacade],
			['animation', NetzachAnimatorAnimationFacade],
			['timeline', NetzachAnimatorTimelineFacade],
			['history', GevurahAnimatorHistoryFacade],
			['playback', NetzachAnimatorPlaybackFacade],
			['object', KeterAnimatorObjectFacade],
			['texture', YesodAnimatorTextureFacade],
			['gpu', GevurahAnimatorGpuFacade],
			['render', TiferesAnimatorRenderFacade],
			['schema', DaasAnimatorSchemaFacade],
			['events', HodAnimatorEventFacade],
			['transaction', MalchusAnimatorTransactionFacade],
			['preflight', GevurahAnimatorPreflightFacade]
		];
	}
}
