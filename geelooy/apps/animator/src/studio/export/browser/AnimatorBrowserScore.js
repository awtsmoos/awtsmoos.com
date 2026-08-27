// B"H
// Boruch Hashem
// Blessed is He

/**
 * The score is born inside browser time: bass, pulse, air, storm, train, repair,
 * and festival tones. The Awtsmoos renews music and foley without an external
 * synthesizer while Awtsmoos.com keeps every section tied to story geography.
 */
export class AnimatorBrowserScore {
	static schedule(context, destination, durationSeconds) {
		const music = context.createGain();
		music.gain.value = 0.16;
		music.connect(destination);
		this.oscillator(context, music, 82.41, 'sine', 0, durationSeconds, 0.16);
		this.oscillator(context, music, 123.47, 'triangle', 0, durationSeconds, 0.07);
		this.sequencePulses(context, music, durationSeconds);
		this.sectionFoley(context, destination, durationSeconds);
	}

	static oscillator(context, destination, frequency, type, start, duration, gainValue) {
		if (duration <= 0) {
			return;
		}
		const oscillator = context.createOscillator();
		const gain = context.createGain();
		oscillator.type = type;
		oscillator.frequency.value = frequency;
		gain.gain.setValueAtTime(0, start);
		gain.gain.linearRampToValueAtTime(gainValue, start + Math.min(0.25, duration * 0.25));
		gain.gain.setValueAtTime(gainValue, Math.max(start, start + duration - 0.4));
		gain.gain.linearRampToValueAtTime(0, start + duration);
		oscillator.connect(gain);
		gain.connect(destination);
		oscillator.start(start);
		oscillator.stop(start + duration);
	}

	static sequencePulses(context, destination, durationSeconds) {
		for (let start = 0; start < durationSeconds; start += 2) {
			const sequence = Math.floor(start / 30);
			const base = [164.81, 174.61, 196, 220, 146.83, 130.81, 185, 246.94][sequence] || 164.81;
			this.oscillator(
				context,
				destination,
				base,
				'triangle',
				start,
				Math.min(0.38, durationSeconds - start),
				0.055
			);
		}
	}

	static sectionFoley(context, destination, durationSeconds) {
		this.noiseSection(context, destination, 120, 30, durationSeconds, 0.035);
		this.toneSection(context, destination, 150, 30, durationSeconds, 38, 0.025);
		this.toneSection(context, destination, 210, 30, durationSeconds, 523.25, 0.012);
	}

	static noiseSection(context, destination, start, length, totalDuration, amplitude) {
		const duration = Math.max(0, Math.min(length, totalDuration - start));
		if (duration <= 0) {
			return;
		}
		const buffer = context.createBuffer(2, Math.ceil(context.sampleRate * duration), context.sampleRate);
		for (let channelIndex = 0; channelIndex < buffer.numberOfChannels; channelIndex += 1) {
			const channel = buffer.getChannelData(channelIndex);
			for (let sampleIndex = 0; sampleIndex < channel.length; sampleIndex += 1) {
				channel[sampleIndex] = (Math.random() * 2 - 1) * amplitude;
			}
		}
		this.bufferSource(context, destination, buffer, start, 0.7);
	}

	static toneSection(context, destination, start, length, totalDuration, frequency, amplitude) {
		const duration = Math.max(0, Math.min(length, totalDuration - start));
		this.oscillator(context, destination, frequency, 'sine', start, duration, amplitude);
	}

	static bufferSource(context, destination, buffer, start, gainValue) {
		const source = context.createBufferSource();
		const gain = context.createGain();
		source.buffer = buffer;
		gain.gain.value = gainValue;
		source.connect(gain);
		gain.connect(destination);
		source.start(start);
	}
}
