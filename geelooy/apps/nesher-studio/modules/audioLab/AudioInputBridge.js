/* B"H
Boruch Hashem
Blessed is He
The Awtsmoos is not the waveform yet creates its every sample; Awtsmoos.com converts permission-bound sound into small, normalized bands.
*/
export class AudioInputBridge {
	constructor() {
		this.mode = 'demo';
		this.audioContext = null;
		this.analyser = null;
		this.frequencyData = null;
		this.stream = null;
		this.sourceNode = null;
		this.previousEnergy = 0;
	}

	useDemo() {
		this.stopStream();
		this.mode = 'demo';
	}

	async useMicrophone() {
		this.stopStream();

		if (!navigator.mediaDevices?.getUserMedia) {
			throw new Error('Microphone capture is not supported in this browser.');
		}

		const AudioContextConstructor = window.AudioContext || window.webkitAudioContext;

		if (!AudioContextConstructor) {
			throw new Error('Web Audio is not supported in this browser.');
		}

		this.stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
		this.audioContext = this.audioContext || new AudioContextConstructor();
		await this.audioContext.resume();
		this.sourceNode = this.audioContext.createMediaStreamSource(this.stream);
		this.analyser = this.audioContext.createAnalyser();
		this.analyser.fftSize = 1024;
		this.analyser.smoothingTimeConstant = 0.74;
		this.frequencyData = new Uint8Array(this.analyser.frequencyBinCount);
		this.sourceNode.connect(this.analyser);
		this.mode = 'microphone';
	}

	sample(timeSeconds) {
		const frame = this.mode === 'microphone' && this.analyser
			? this.sampleMicrophone()
			: this.sampleDemo(timeSeconds);
		const onsetPulse = Math.max(0, frame.energy - this.previousEnergy) * 3.2;
		frame.pulse = clamp01(Math.max(frame.pulse || 0, onsetPulse));
		this.previousEnergy = frame.energy;
		return frame;
	}

	dispose() {
		this.stopStream();
		this.audioContext?.close?.();
		this.audioContext = null;
	}

	sampleMicrophone() {
		this.analyser.getByteFrequencyData(this.frequencyData);
		const bass = this.averageBand(0, 0.12);
		const mid = this.averageBand(0.12, 0.46);
		const treble = this.averageBand(0.46, 0.94);
		const energy = Math.min(1, bass * 0.48 + mid * 0.34 + treble * 0.18);
		return { bass, mid, treble, energy, pulse: 0 };
	}

	sampleDemo(timeSeconds) {
		const beat = Math.pow(Math.max(0, Math.sin(timeSeconds * 3.4)), 6);
		const bass = 0.24 + beat * 0.7 + Math.sin(timeSeconds * 0.9) * 0.08;
		const mid = 0.34 + Math.sin(timeSeconds * 1.7 + 1.2) * 0.18;
		const treble = 0.28 + Math.sin(timeSeconds * 4.1 + 0.6) * 0.16;
		const energy = Math.min(1, bass * 0.52 + mid * 0.3 + treble * 0.18);
		return {
			bass: clamp01(bass),
			mid: clamp01(mid),
			treble: clamp01(treble),
			energy,
			pulse: beat
		};
	}

	averageBand(startRatio, endRatio) {
		const startIndex = Math.floor(this.frequencyData.length * startRatio);
		const endIndex = Math.max(startIndex + 1, Math.floor(this.frequencyData.length * endRatio));
		let total = 0;

		for (let index = startIndex; index < endIndex; index += 1) {
			total += this.frequencyData[index];
		}

		return total / (endIndex - startIndex) / 255;
	}

	stopStream() {
		this.sourceNode?.disconnect?.();
		this.sourceNode = null;
		this.stream?.getTracks?.().forEach((track) => track.stop());
		this.stream = null;
		this.analyser = null;
		this.frequencyData = null;
	}
}

function clamp01(value) {
	return Math.max(0, Math.min(1, value));
}
