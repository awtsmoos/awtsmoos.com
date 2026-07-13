// B"H
// Boruch Hashem
// Blessed is He

import { SpeechTimingModel } from '../speech/SpeechTimingModel.js';

/**
 * A mouth is not a metronome. The Awtsmoos gives each letter its own vessel,
 * and this model reveals distinct closures, rounds, teeth, and open vowels
 * from real text while remaining deterministic for silent Awtsmoos.com tests.
 */
export class MouthPhonemeModel {
	static from(input = {}) {
		const speech = String(input.speech ?? '');
		const talking = input.talking ?? (speech.length > 0 || input.silentMode === true);
		const emotion = String(input.emotion ?? 'calm').toLowerCase();

		if (!talking) {
			return this.restPose(emotion);
		}

		const timing = SpeechTimingModel.sample({
			speech,
			progress: input.progress,
			time: input.time,
			duration: input.duration
		});
		const shape = this.shapeFor(timing.symbol);
		const style = this.styleFor(input.style ?? input.speechStyle);
		const energy = this.clamp(Number(input.energy ?? 1), 0, 1.5);
		const envelope = Number.isFinite(Number(input.audioEnvelope))
			? this.clamp(Number(input.audioEnvelope), 0, 1)
			: timing.pulse;
		const articulation = timing.isPause ? 0 : Math.max(0.16, envelope);
		const open = this.clamp(shape.open * (0.34 + articulation * 0.86) * style.open * energy);
		const smile = this.clamp(this.emotionSmile(emotion) + style.smile, 0, 1);

		return {
			shape: shape.name,
			symbol: timing.symbol,
			open,
			jaw: this.clamp(open * shape.jaw * style.jaw),
			width: this.clamp(shape.width + smile * 0.28),
			round: this.clamp(shape.round),
			press: this.clamp(shape.press * (1 - articulation * 0.45)),
			teeth: this.clamp(shape.teeth),
			smile,
			phase: timing.phase,
			isPause: timing.isPause
		};
	}

	static shapeFor(symbol = '') {
		const letter = String(symbol).toLowerCase();
		if (/[bmp]/u.test(letter)) return { name: 'closed', open: 0.08, jaw: 0.35, width: 0.18, round: 0.08, press: 0.92, teeth: 0 };
		if (/[fv]/u.test(letter)) return { name: 'teeth', open: 0.28, jaw: 0.5, width: 0.42, round: 0.08, press: 0.12, teeth: 0.82 };
		if (/[ouqw]/u.test(letter)) return { name: 'round', open: 0.5, jaw: 0.72, width: 0.12, round: 0.9, press: 0.08, teeth: 0 };
		if (/[aáàâäah]/u.test(letter)) return { name: 'open', open: 0.86, jaw: 0.94, width: 0.46, round: 0.16, press: 0, teeth: 0 };
		if (/[eéiíy sz]/u.test(letter)) return { name: 'wide', open: 0.38, jaw: 0.58, width: 0.82, round: 0.04, press: 0.04, teeth: 0.36 };
		return { name: 'neutral', open: 0.42, jaw: 0.64, width: 0.38, round: 0.18, press: 0.08, teeth: 0.08 };
	}

	static styleFor(style = 'normal') {
		const name = String(style).toLowerCase();
		if (name === 'whisper') return { open: 0.58, jaw: 0.62, smile: 0 };
		if (name === 'shout') return { open: 1.28, jaw: 1.22, smile: 0.04 };
		if (name === 'laugh') return { open: 1.12, jaw: 1.08, smile: 0.52 };
		if (name === 'mutter') return { open: 0.48, jaw: 0.52, smile: -0.02 };
		return { open: 1, jaw: 1, smile: 0 };
	}

	static restPose(emotion) {
		return { shape: 'rest', symbol: '', open: /amazed|surprised/u.test(emotion) ? 0.36 : 0.04, jaw: 0.04, width: 0.12, round: 0.08, press: 0, teeth: 0, smile: this.emotionSmile(emotion), phase: 0, isPause: true };
	}

	static emotionSmile(emotion) {
		return /happy|delighted|warm|relieved|playful|proud/u.test(emotion) ? 0.55 : /skeptical/u.test(emotion) ? 0.05 : 0.16;
	}

	static clamp(value, minimum = 0, maximum = 1) {
		return Math.min(maximum, Math.max(minimum, Number.isFinite(value) ? value : minimum));
	}
}
