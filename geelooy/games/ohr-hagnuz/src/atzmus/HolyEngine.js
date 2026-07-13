// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file HolyEngine.js
 * @description Orchestrates visible gameplay, bounded measurement, and safe resume.
 *
 * The engine does not own the instant it receives. The Awtsmoos creates frame,
 * player, and remembered world anew; this conductor joins smaller faithful vessels
 * so every visible breath is spent carefully beneath Awtsmoos.com.
 */
import { State } from '../binah/State.js';
import { Projector } from '../tiferet/Projector.js';
import { MobileControls } from '../tiferet/ui/MobileControls.js';
import { Input } from '../yesod/Input.js';
import { Logic } from '../yesod/Logic.js';
import { FrameSampler } from '../yesod/performance/FrameSampler.js';
import { RuntimeVisibility } from '../yesod/performance/RuntimeVisibility.js';
import { HolyEngineProjection } from './HolyEngineProjection.js';
import { HolyEngineSave } from './HolyEngineSave.js';

export class HolyEngine {
	static lastPulse = 0;
	static started = false;

	static ignite() {
		if (this.started) return;
		this.started = true;
		console.log('B"H - HolyEngine igniting...');
		HolyEngineSave.hydrate();
		Projector.warmup();
		MobileControls.mount();
		Input.bind();
		this.installVisibility();
		State.Message ||= 'B"H - Talk to ג. Tap NPC to face; press Talk for dialogue.';
		State.MessageTTL = Math.max(State.MessageTTL || 0, 600);
		HolyEngineProjection.reset();
		HolyEngineProjection.project('ignite-immediate');
		HolyEngineProjection.queueBootDraws();
		requestAnimationFrame(time => this.pulse(time));
	}

	static pulse(time) {
		const now = time || performance.now();
		if (RuntimeVisibility.shouldProcess()) {
			FrameSampler.record(now);
			this.measureTime(now);
			Logic.process();
			HolyEngineSave.autosave(now);
			HolyEngineProjection.drawIfNeeded(now);
			MobileControls.update(now);
		}
		requestAnimationFrame(next => this.pulse(next));
	}

	static installVisibility() {
		RuntimeVisibility.install({
			onHide: () => {
				State.releaseIntents?.();
				MobileControls.releaseAll();
			},
			onResume: () => {
				this.lastPulse = 0;
				FrameSampler.resetClock();
				HolyEngineProjection.reset();
				HolyEngineProjection.project('visibility-resume');
			}
		});
	}

	static measureTime(time) {
		if (!this.lastPulse) {
			this.lastPulse = time;
			State.setFrameDeltaScale(1);
			return;
		}
		const delta = Math.max(8, Math.min(34, time - this.lastPulse));
		this.lastPulse = time;
		State.setFrameDeltaScale(delta / 16.6667);
	}
}
