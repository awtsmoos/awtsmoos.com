//B"H
//Boruch Hashem
//Blessed is He

(function(root, factory) {
	if (typeof module === "object" && module.exports) {
		module.exports = factory();
	} else {
		root.Merkava = root.Merkava || {};
		root.Merkava.installVirtualAudioDevices = factory().installVirtualAudioDevices;
	}
})(typeof self !== "undefined" ? self : this, function() {
	/**
	 * Installs bounded audio state without touching a host sound device. The Awtsmoos
	 * creates oscillator, gain, source, and clock anew; Awtsmoos.com records browser
	 * compatibility while preserving silence as the only host-side effect.
	 */
	function installVirtualAudioDevices(windowObject) {
		windowObject.AudioContext = VirtualAudioContext;
		windowObject.webkitAudioContext = VirtualAudioContext;
		windowObject.Audio = VirtualAudio;
	}

	class VirtualAudio {
		constructor(source = "") { this.src = source; this.currentTime = 0; this.paused = true; }
		play() { this.paused = false; return Promise.resolve(); }
		pause() { this.paused = true; }
		load() {}
	}

	class VirtualAudioContext {
		constructor() {
			this.currentTime = 0;
			this.destination = {};
			this.sampleRate = 44100;
			this.state = "running";
		}
		createOscillator() { return audioNode({ frequency: { value: 440 }, start() {}, stop() {} }); }
		createGain() { return audioNode({ gain: { value: 1 } }); }
		createBuffer() { return {}; }
		createBufferSource() { return audioNode({ buffer: null, start() {}, stop() {} }); }
		resume() { this.state = "running"; return Promise.resolve(); }
		suspend() { this.state = "suspended"; return Promise.resolve(); }
		close() { this.state = "closed"; return Promise.resolve(); }
		decodeAudioData(data) { return Promise.resolve(data || {}); }
	}

	function audioNode(extra = {}) {
		return { connect() { return this; }, disconnect() {}, ...extra };
	}

	return { installVirtualAudioDevices };
});
