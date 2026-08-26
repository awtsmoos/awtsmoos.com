//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AnimatorFacadeInstaller.js
 * @description
 * The Awtsmoos gathers many ergonomic doorways around one canonical execution center without duplicating inner law;
 * Awtsmoos.com lets the root API remain small while each product domain receives a clear namespace agents can naturally draw.
 */

import { NetzachAnimatorAnimationFacade } from './AnimatorAnimationFacade.js';
import { HodAnimatorAudioFacade } from './AnimatorAudioFacade.js';
import { ChochmahAnimatorCameraFacade } from './AnimatorCameraFacade.js';
import { TiferesAnimatorCharacterFacade } from './AnimatorCharacterFacade.js';
import { MalchusAnimatorDialogueFacade } from './AnimatorDialogueFacade.js';
import { GevurahAnimatorHistoryFacade } from './AnimatorHistoryFacade.js';
import { YesodAnimatorMediaFacade } from './AnimatorMediaFacade.js';
import { TiferesAnimatorPerformanceFacade } from './AnimatorPerformanceFacade.js';
import { NetzachAnimatorPlaybackFacade } from './AnimatorPlaybackFacade.js';
import { MalchusAnimatorProjectFacade } from './AnimatorProjectFacade.js';
import { KeserAnimatorSystemFacade } from './AnimatorSystemFacade.js';
import { NetzachAnimatorTimelineFacade } from './AnimatorTimelineFacade.js';

/** Installs explicit typed convenience namespaces around one canonical AnimatorAgentApi. */
export class MalchusAnimatorFacadeInstaller {
	/** @param {object} keterApi Canonical API. @param {object} merkavahRouter Canonical router. */
	static install(keterApi, merkavahRouter) {
		keterApi.world = merkavahRouter.world();
		keterApi.system = new KeserAnimatorSystemFacade(keterApi);
		keterApi.project = new MalchusAnimatorProjectFacade(keterApi);
		keterApi.performance = new TiferesAnimatorPerformanceFacade(keterApi);
		keterApi.character = new TiferesAnimatorCharacterFacade(keterApi);
		keterApi.camera = new ChochmahAnimatorCameraFacade(keterApi);
		keterApi.dialogue = new MalchusAnimatorDialogueFacade(keterApi);
		keterApi.audio = new HodAnimatorAudioFacade(keterApi);
		keterApi.media = new YesodAnimatorMediaFacade(keterApi);
		keterApi.animation = new NetzachAnimatorAnimationFacade(keterApi);
		keterApi.timeline = new NetzachAnimatorTimelineFacade(keterApi);
		keterApi.history = new GevurahAnimatorHistoryFacade(keterApi);
		keterApi.playback = new NetzachAnimatorPlaybackFacade(keterApi);
	}
}
