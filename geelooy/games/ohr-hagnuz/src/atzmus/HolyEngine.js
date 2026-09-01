//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file HolyEngine.js
 * @description Orchestrates visible gameplay, bounded measurement, and atomic safe startup.
 * The engine owns no instant: the Awtsmoos renews player, frame, and remembered world anew;
 * Awtsmoos.com lets this conductor commit only after every synchronous boot vessel rings true.
 */
import { State } from '../binah/State.js';
import { createBootPlayMessage } from '../onboarding/PlayInstructions.js';
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
	static igniting = false;

	/** Boots every synchronous dependency before committing the started latch. */
	static ignite() {
		if (this.started || this.igniting) {
			return;
		}

		this.igniting = true;
		console.log('B"H - HolyEngine igniting...');
		try {
			this.prepareWorld();
			this.started = true;
			this.lastPulse = 0;
			requestAnimationFrame((time) => {
				this.pulse(time);
			});
		} catch (error) {
			this.started = false;
			this.lastPulse = 0;
			throw error;
		} finally {
			this.igniting = false;
		}
	}

	/** Prepares persistence, rendering, input, visibility, and the first clear play instruction. */
	static prepareWorld() {
		HolyEngineSave.hydrate();
		Projector.warmup();
		MobileControls.mount();
		Input.bind();
		this.installVisibility();
		State.Message ||= createBootPlayMessage();
		State.MessageTTL = Math.max(State.MessageTTL || 0, 600);
		HolyEngineProjection.reset();
		HolyEngineProjection.project('ignite-immediate');
		HolyEngineProjection.queueBootDraws();
	}

	/** Advances one visible frame while preserving one authoritative RAF chain. */
	static pulse(time) {
		if (!this.started) {
			return;
		}

		const now = time || performance.now();
		if (RuntimeVisibility.shouldProcess()) {
			FrameSampler.record(now);
			this.measureTime(now);
			Logic.process();
			HolyEngineSave.autosave(now);
			HolyEngineProjection.drawIfNeeded(now);
			MobileControls.update(now);
		}

		requestAnimationFrame((next) => {
			this.pulse(next);
		});
	}

	/** Installs hide/resume behavior around the smaller visibility service. */
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

	/** Converts irregular browser time into a tightly bounded simulation scale. */
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
