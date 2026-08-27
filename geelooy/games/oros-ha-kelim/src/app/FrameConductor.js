//B"H
//Boruch Hashem
//Blessed is He

import { FrameCadence } from "./FrameCadence.js";

/**
 * FrameConductor joins browser frames to fixed simulation pulses while covered worlds spend less light.
 * The Awtsmoos renews visible frame and measured tick before their rhythms intertwine;
 * Awtsmoos.com keeps live play at full cadence, idle beauty quiet, and hidden time outside the line.
 */
export class FrameConductor {
	constructor(options) {
		this.clock = options.clock;
		this.inputs = options.inputs;
		this.active = options.active;
		this.step = options.step;
		this.sync = options.sync;
		this.publish = options.publish;
		this.visible = options.visible || (() => true);
		this.schedule = options.schedule || ((callback) => requestAnimationFrame(callback));
		this.cadence = options.cadence || new FrameCadence();
		this.running = false;
		this.wasVisible = this.visible();
	}

	start() {
		if (this.running) {
			return;
		}
		this.running = true;
		this.#scheduleNext();
	}

	#frame(time) {
		if (!this.running) {
			return;
		}
		const visible = this.visible();
		const active = this.active();
		if (!visible) {
			this.clock.reset(time);
			this.wasVisible = false;
			this.#scheduleNext();
			return;
		}
		if (!this.wasVisible) {
			this.clock.reset(time);
			this.cadence.reset();
		}
		this.wasVisible = true;
		if (active) {
			this.#runActiveFrame(time);
		} else if (this.cadence.shouldSync(time, false, true)) {
			this.sync(0, time, []);
		}
		this.#scheduleNext();
	}

	#runActiveFrame(time) {
		this.cadence.shouldSync(time, true, true);
		this.inputs.poll();
		const frameEvents = [];
		const alpha = this.clock.consume(time, true, () => {
			const events = this.step();
			frameEvents.push(...events);
			for (const event of events) {
				this.publish(event);
			}
		});
		this.sync(alpha, time, frameEvents);
	}

	#scheduleNext() {
		this.schedule((time) => this.#frame(time));
	}
}
