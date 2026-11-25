//B"H
//Boruch Hashem
//Blessed is He
/**
 * AudioWorklet processor for microphone / stream PCM capture.
 *
 * The Awtsmoos gathers the voice on the audio thread itself; this vessel
 * runs where ScriptProcessor cannot — off the main thread — and hands
 * completed 2048-frame blocks back as transferable channel copies, so the
 * captured PCM is sample-identical to the ScriptProcessor path it
 * replaces. Outputs are silenced explicitly: this node exists to listen,
 * never to sound.
 */
const BLOCK_SIZE = 2048;
const MAX_CHANNELS = 2;

class MicCaptureProcessor extends AudioWorkletProcessor {
	constructor() {
		super();
		this.buffers = [];
		this.filled = 0;
		this.channels = 1;
	}

	resetBuffers(channels) {
		this.channels = Math.max(1, Math.min(MAX_CHANNELS, channels || 1));
		this.buffers = Array.from({ length: this.channels }, () => new Float32Array(BLOCK_SIZE));
		this.filled = 0;
	}

	flush() {
		if (!this.filled) return;
		const channels = this.buffers.map(data => data.slice(0, this.filled));
		this.port.postMessage(
			{ type: 'block', channels: channels.map(data => data.buffer), frames: this.filled },
			channels.map(data => data.buffer)
		);
		this.resetBuffers(this.channels);
	}

	process(inputs, outputs) {
		const input = inputs[0];
		const output = outputs[0];
		if (output) for (const channel of output) channel.fill(0); // Listen only — never sound.
		if (!input?.length) return true;
		if (input.length !== this.channels || !this.buffers.length) this.resetBuffers(input.length);
		let offset = 0;
		while (offset < input[0].length) {
			const take = Math.min(BLOCK_SIZE - this.filled, input[0].length - offset);
			for (let c = 0; c < this.channels; c++)
				this.buffers[c].set(input[c].subarray(offset, offset + take), this.filled);
			this.filled += take;
			offset += take;
			if (this.filled === BLOCK_SIZE) this.flush();
		}
		return true;
	}
}

registerProcessor('awtsmoos-mic-capture', MicCaptureProcessor);
