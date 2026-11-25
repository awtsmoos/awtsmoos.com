//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MicCapture
 * @description
 * The Awtsmoos lets a voice be gathered while the song is still sounding;
 * Awtsmoos.com captures raw PCM on the shared audio clock — never through
 * a codec — so a take can be placed on the timeline sample-honestly.
 * One engine serves the piano surface and the Studio alike.
 *
 * Capture runs on an AudioWorklet where the browser offers one (the
 * voice is gathered on the audio thread, off the main thread), and falls
 * back automatically to ScriptProcessor where it does not. Both paths
 * deliver the same 2048-frame PCM blocks, sample for sample.
 */
import {
	FeedbackGuard,
	buildMicConstraints,
	micErrorMessage,
	resolveMonitorEnabled,
	totalLatencyCompensation
} from './micSafety.js';

const BLOCK_SIZE = 2048;
const WORKLET_NAME = 'awtsmoos-mic-capture';

/**
 * Attaches a block-capture node between a source and a silenced output.
 * Prefers the AudioWorklet; any worklet failure (unsupported browser,
 * module load error) falls back to ScriptProcessor unless the caller
 * explicitly demanded one backend.
 * @param {Object} input - {context, source, onBlock, backend}.
 * @returns {Promise<Object>} {backend, disconnect()}.
 */
export async function attachBlockCapture({ context, source, onBlock, backend = 'auto' }) {
	if (backend !== 'script' && context.audioWorklet && typeof globalThis.AudioWorkletNode === 'function') {
		try {
			await context.audioWorklet.addModule(new URL('./micWorkletProcessor.js', import.meta.url));
			const node = new AudioWorkletNode(context, WORKLET_NAME, {
				numberOfInputs: 1, numberOfOutputs: 1, outputChannelCount: [2]
			});
			const silence = context.createGain();
			silence.gain.value = 0;
			node.connect(silence);
			silence.connect(context.destination); // Node runs; its output is silenced.
			source.connect(node);
			node.port.onmessage = event => {
				if (event.data?.type !== 'block') return;
				onBlock(event.data.channels.map(buffer => new Float32Array(buffer)), event.data.frames);
			};
			return {
				backend: 'worklet',
				disconnect() {
					node.port.onmessage = null;
					try { node.disconnect(); } catch (_) { /* Already detached. */ }
					try { silence.disconnect(); } catch (_) { /* Already detached. */ }
				}
			};
		} catch (error) {
			if (backend === 'worklet') throw error;
			// Automatic fallback: ScriptProcessor below gathers the same PCM.
		}
	}
	const processor = context.createScriptProcessor(BLOCK_SIZE, 2, 2);
	const silence = context.createGain();
	silence.gain.value = 0;
	processor.connect(silence);
	silence.connect(context.destination); // Processor runs; its passthrough is silenced.
	source.connect(processor);
	processor.onaudioprocess = event => {
		const input = event.inputBuffer;
		const block = [];
		for (let channel = 0; channel < input.numberOfChannels; channel++) {
			const data = new Float32Array(input.length);
			input.copyFromChannel(data, channel);
			block.push(data);
		}
		onBlock(block, input.length);
	};
	return {
		backend: 'script',
		disconnect() {
			processor.onaudioprocess = null;
			try { processor.disconnect(); } catch (_) { /* Already detached. */ }
			try { silence.disconnect(); } catch (_) { /* Already detached. */ }
		}
	};
}

/**
 * A live microphone capture session. The input is analysed always and
 * heard (monitored) only through the safety gate; the recording itself
 * can never be muted by the feedback guard.
 */
export class MicCaptureSession {
	constructor(options = {}) {
		this.onFeedbackCut = options.onFeedbackCut || (() => {});
		this.onLevel = options.onLevel || (() => {});
		this.guard = new FeedbackGuard(options.guardOptions);
		this.backendPreference = options.backend || 'auto';
		this.active = false;
		this.monitoring = false;
		this.feedbackCut = false;
		this.chunks = [];
		this.channels = 1;
		this.backend = null;
	}

	/**
	 * Requests the microphone (call only from an explicit user gesture)
	 * and starts capturing on the given context.
	 * @param {Object} input - {context, mode, monitor, monitorDestination, duckGainNode, duckDb, backend}.
	 * @returns {Promise<Object>} Session facts incl. latency parts and capture backend.
	 */
	async start(input = {}) {
		if (this.active) throw new Error('Microphone capture is already running.');
		const context = input.context;
		if (!context) throw new Error('Start the Piano audio engine before recording.');
		if (context.state === 'suspended') await context.resume();
		if (!globalThis.navigator?.mediaDevices?.getUserMedia)
			throw new Error('Microphone capture is not supported by this browser.');
		let stream;
		try {
			stream = await navigator.mediaDevices.getUserMedia(
				buildMicConstraints(input.mode, { autoGainControl: input.autoGainControl }));
		} catch (error) {
			throw new Error(micErrorMessage(error));
		}
		this.context = context;
		this.stream = stream;
		this.mode = input.mode;
		this.source = context.createMediaStreamSource(stream);
		this.inputGain = context.createGain();
		this.inputGain.gain.value = Number(input.inputGain) > 0 ? Number(input.inputGain) : 1;
		this.source.connect(this.inputGain); // Singer-controlled input gain feeds every branch alike.
		this.analyser = context.createAnalyser();
		this.analyser.fftSize = BLOCK_SIZE;
		this.inputGain.connect(this.analyser); // Analysis branch only — never reaches an output.
		this.captureNode = await attachBlockCapture({
			context,
			source: this.inputGain,
			backend: input.backend || this.backendPreference,
			onBlock: (block, frames) => this.captureBlock(block, frames)
		});
		this.backend = this.captureNode.backend;
		if (input.recordDestination) {
			// Recording tap: the live voice also feeds the app's main
			// recording stream, so a Record Audio/Video capture made
			// alongside this take contains the singing too. This is a
			// recording destination, never a speaker — no feedback path.
			this.recordTap = context.createGain();
			this.recordTap.gain.value = 1;
			this.inputGain.connect(this.recordTap);
			this.recordTap.connect(input.recordDestination);
		}
		this.monitorGain = context.createGain();
		this.monitorGain.gain.value = 0;
		this.monitorDestination = input.monitorDestination || null;
		if (this.monitorDestination) {
			this.inputGain.connect(this.monitorGain);
			this.monitorGain.connect(this.monitorDestination);
		}
		this.setMonitor(Boolean(input.monitor));
		if (input.duckGainNode && Number(input.duckDb) < 0) {
			this.duckNode = input.duckGainNode;
			this.duckPrior = input.duckGainNode.gain.value;
			const factor = Math.pow(10, Number(input.duckDb) / 20);
			input.duckGainNode.gain.setTargetAtTime(this.duckPrior * factor, context.currentTime, 0.05);
		}
		const track = stream.getAudioTracks()[0];
		const settings = track?.getSettings ? track.getSettings() : {};
		this.latency = {
			outputLatency: context.outputLatency || 0,
			baseLatency: context.baseLatency || 0,
			inputLatency: Number(settings.latency) || 0
		};
		this.startContextTime = context.currentTime;
		this.active = true;
		return {
			startContextTime: this.startContextTime,
			latency: this.latency,
			compensation: totalLatencyCompensation(this.latency),
			monitoring: this.monitoring,
			backend: this.backend
		};
	}

	/** One captured PCM block (either backend): store it, meter it, guard it. */
	captureBlock(block) {
		this.channels = Math.max(this.channels, Math.min(2, block.length || 1));
		this.chunks.push(block);
		const data = block[0] || new Float32Array(0);
		let sum = 0;
		let peak = 0;
		for (const value of data) {
			sum += value * value;
			peak = Math.max(peak, Math.abs(value));
		}
		const rms = data.length ? Math.sqrt(sum / data.length) : 0;
		this.onLevel({ rms, peak });
		if (this.guard.feed({ rms, peak, monitoring: this.monitoring, nowMs: performance.now() }) === 'cut')
			this.cutMonitor();
	}

	/** Live input-gain change (the singer's mic slider) mid-capture. */
	setInputGain(value) {
		const gain = Math.min(3, Math.max(0, Number(value) || 0));
		if (this.inputGain && this.context)
			this.inputGain.gain.setTargetAtTime(gain, this.context.currentTime, 0.03);
		return gain;
	}

	/** Enables or mutes the monitor path through the shared safety gate. */
	setMonitor(requested) {
		this.monitoring = resolveMonitorEnabled(requested, this.mode) && !this.feedbackCut;
		if (this.monitorGain && this.context)
			this.monitorGain.gain.setTargetAtTime(this.monitoring ? 1 : 0, this.context.currentTime, 0.02);
		return this.monitoring;
	}

	/** Feedback cut: monitor dies instantly; the recording keeps rolling. */
	cutMonitor() {
		if (this.feedbackCut) return;
		this.feedbackCut = true;
		this.monitoring = false;
		if (this.monitorGain) this.monitorGain.gain.value = 0;
		this.onFeedbackCut();
	}

	/** Explicit user re-arm after a feedback cut (headphones only). */
	rearmMonitor() {
		this.feedbackCut = false;
		this.guard.reset();
		return this.setMonitor(true);
	}

	/**
	 * Stops capture, releases the microphone immediately (device light
	 * off) and returns the recorded PCM as an AudioBuffer.
	 * @returns {Promise<Object>} {buffer, duration, startContextTime, latency, compensation, feedbackCut, monitoring, backend}.
	 */
	async stop() {
		if (!this.active) return null;
		this.active = false;
		this.captureNode?.disconnect();
		this.captureNode = null;
		if (this.duckNode && this.context)
			this.duckNode.gain.setTargetAtTime(this.duckPrior, this.context.currentTime, 0.05);
		for (const node of [this.monitorGain, this.recordTap, this.analyser, this.inputGain, this.source]) {
			try { node?.disconnect(); } catch (_) { /* Already detached. */ }
		}
		this.stream?.getTracks().forEach(track => track.stop());
		const releasedStream = this.stream;
		this.stream = null;
		const sampleRate = this.context.sampleRate;
		const frames = this.chunks.reduce((total, block) => total + block[0].length, 0);
		const buffer = this.context.createBuffer(Math.max(1, this.channels), Math.max(1, frames), sampleRate);
		for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
			const data = buffer.getChannelData(channel);
			let offset = 0;
			for (const block of this.chunks) {
				const source = block[Math.min(channel, block.length - 1)];
				data.set(source, offset);
				offset += source.length;
			}
		}
		this.chunks = [];
		return {
			buffer,
			duration: frames / sampleRate,
			startContextTime: this.startContextTime,
			latency: this.latency,
			compensation: totalLatencyCompensation(this.latency),
			feedbackCut: this.feedbackCut,
			monitoring: this.monitoring,
			backend: this.backend,
			stream: releasedStream
		};
	}
}

/**
 * Captures any media stream (typically the app's record stream, which
 * carries the piano master) to raw PCM on the shared audio clock, so a
 * simultaneous performance can be mixed with a mic take sample-honestly.
 */
export class StreamPcmTap {
	constructor(context, stream, options = {}) {
		this.context = context;
		this.stream = stream;
		this.chunks = [];
		this.channels = 2;
		this.active = false;
		this.backendPreference = options.backend || 'auto';
		this.backend = null;
	}

	/** Starts pulling PCM from the stream (worklet where supported). */
	async start() {
		if (this.active) return;
		const context = this.context;
		this.source = context.createMediaStreamSource(this.stream);
		this.captureNode = await attachBlockCapture({
			context,
			source: this.source,
			backend: this.backendPreference,
			onBlock: block => { this.chunks.push(block); }
		});
		this.backend = this.captureNode.backend;
		this.startContextTime = context.currentTime;
		this.active = true;
	}

	/** Stops and returns {buffer, startContextTime, duration, backend}. */
	async stop() {
		if (!this.active) return null;
		this.active = false;
		this.captureNode?.disconnect();
		this.captureNode = null;
		for (const node of [this.source]) {
			try { node?.disconnect(); } catch (_) { /* Already detached. */ }
		}
		const sampleRate = this.context.sampleRate;
		const frames = this.chunks.reduce((total, block) => total + block[0].length, 0);
		const buffer = this.context.createBuffer(Math.max(1, this.channels), Math.max(1, frames), sampleRate);
		for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
			const data = buffer.getChannelData(channel);
			let offset = 0;
			for (const block of this.chunks) {
				const source = block[Math.min(channel, block.length - 1)];
				data.set(source, offset);
				offset += source.length;
			}
		}
		this.chunks = [];
		return { buffer, startContextTime: this.startContextTime, duration: frames / sampleRate, backend: this.backend };
	}
}
