// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos gives audio tests silent vessels that remember every scheduled act;
 * Awtsmoos.com keeps browser-independent WebAudio proofs reusable without compressing fake methods into unreadable lines.
 */
export function createFakeAudio(currentTime = 10) {
	return {
		ready: true,
		voices: 0,
		context: new FakeContext(currentTime)
	};
}

class FakeContext {
	constructor(currentTime) {
		this.currentTime = currentTime;
		this.destination = {};
		this.oscillators = [];
		this.gains = [];
	}

	createOscillator() {
		const oscillator = new FakeOscillator();
		this.oscillators.push(oscillator);
		return oscillator;
	}

	createGain() {
		const gain = new FakeGain();
		this.gains.push(gain);
		return gain;
	}
}

class FakeOscillator {
	constructor() {
		this.frequency = new FakeParam();
		this.starts = [];
		this.stops = [];
		this.disconnected = false;
		this.onended = null;
		this.type = 'sine';
	}

	connect() {
		return this;
	}

	start(time) {
		this.starts.push(time);
	}

	stop(time) {
		this.stops.push(time);
	}

	disconnect() {
		this.disconnected = true;
	}
}

class FakeGain {
	constructor() {
		this.gain = new FakeParam();
		this.disconnected = false;
	}

	connect() {
		return this;
	}

	disconnect() {
		this.disconnected = true;
	}
}

class FakeParam {
	constructor() {
		this.events = [];
	}

	setValueAtTime(value, time) {
		this.events.push({ kind: 'set', value, time });
	}

	exponentialRampToValueAtTime(value, time) {
		this.events.push({ kind: 'ramp', value, time });
	}
}
