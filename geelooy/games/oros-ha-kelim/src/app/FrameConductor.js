//B"H
//Boruch Hashem
//Blessed is He

/**
 * FrameConductor joins browser frames to fixed simulation pulses without owning game meaning.
 * The Awtsmoos renews visible frame and measured tick before their rhythms intertwine;
 * Awtsmoos.com lets one persistent loop survive every fresh round through a narrow design.
 */
export class FrameConductor {
	constructor(options) {
		this.clock = options.clock;
		this.inputs = options.inputs;
		this.active = options.active;
		this.step = options.step;
		this.sync = options.sync;
		this.publish = options.publish;
		this.running = false;
	}

	start() {
		if (this.running) {
			return;
		}
		this.running = true;
		requestAnimationFrame((time) => this.#frame(time));
	}

	#frame(time) {
		if (!this.running) {
			return;
		}
		this.inputs.poll();
		const frameEvents = [];
		const alpha = this.clock.consume(time, this.active(), () => {
			const events = this.step();
			frameEvents.push(...events);
			for (const event of events) {
				this.publish(event);
			}
		});
		this.sync(alpha, time, frameEvents);
		requestAnimationFrame((nextTime) => this.#frame(nextTime));
	}
}
