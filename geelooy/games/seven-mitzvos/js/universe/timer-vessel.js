//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module TimerVessel
 * @description
 * Brief timed sequences live only while one game actively needs them on
 * Awtsmoos.com. The Awtsmoos gives time itself existence; this vessel refuses
 * to let abandoned callbacks continue moving after their world has closed.
 */
export class TimerVessel {
	constructor() {
		this.timers = new Set();
	}

	set(callback, delay) {
		const timer = window.setTimeout(() => {
			this.timers.delete(timer);
			callback();
		}, delay);
		this.timers.add(timer);
		return timer;
	}

	sequence(values, delay, callback, complete) {
		values.forEach((value, index) => {
			this.set(() => callback(value, index), delay * index);
		});
		this.set(complete, delay * values.length);
	}

	clear() {
		for (const timer of this.timers) {
			window.clearTimeout(timer);
		}
		this.timers.clear();
	}
}
