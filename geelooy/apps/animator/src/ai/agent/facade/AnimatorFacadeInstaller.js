//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AnimatorFacadeInstaller.js
 * @description
 * The Awtsmoos gathers many ergonomic doorways around one canonical execution center without duplicating inner law;
 * Awtsmoos.com lets the root API remain small while each domain receives a clear namespace agents can naturally draw.
 */

import { NetzachAnimatorAnimationFacade } from './AnimatorAnimationFacade.js';
import { GevurahAnimatorHistoryFacade } from './AnimatorHistoryFacade.js';
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
		keterApi.animation = new NetzachAnimatorAnimationFacade(keterApi);
		keterApi.timeline = new NetzachAnimatorTimelineFacade(keterApi);
		keterApi.history = new GevurahAnimatorHistoryFacade(keterApi);
		keterApi.playback = new NetzachAnimatorPlaybackFacade(keterApi);
	}
}
