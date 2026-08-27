// B"H
// Boruch Hashem
// Blessed is He

import { StableSpeechDelivery } from './StableSpeechDelivery.js';

/**
 * Coarticulation remains the skeleton while delivery and emotion color its flesh.
 * The Awtsmoos renews every transition; Awtsmoos.com keeps closure, tongue, teeth,
 * rounding, manual direction, persistence, preview, and export in one mouth truth.
 */
export class StableSpeechArticulationMixer {
	static mix(base, input, sample, cueCount) {
		const style = StableSpeechDelivery.style(
			String(input.style || input.speechStyle || 'normal')
		);
		const emotion = StableSpeechDelivery.emotion(input.emotion);
		const energy = this.clamp(Number(input.energy ?? 1), 0.28, 1.55);
		const pulse = Math.pow(Math.sin(Math.PI * sample.phase), 0.7);
		const envelope = Number.isFinite(Number(input.audioEnvelope))
			? this.clamp(Number(input.audioEnvelope))
			: base.isPause ? 0 : 0.62 + pulse * 0.38;
		const releasePop = Number(base.release || 0) * 0.2;
		const closure = this.clamp(
			base.closure * (1 - base.release * 0.62)
		);
		const vowelEnergy = 0.72 + envelope * 0.4;
		const open = (base.open * vowelEnergy + releasePop)
			* style.open
			* Math.min(1.25, energy);
		const asymmetry = this.asymmetry(input, base.isPause)
			+ emotion.asymmetry * (base.isPause ? 0 : 1);
		const result = {
			shape: base.name,
			viseme: base.name,
			phoneme: base.phoneme,
			cueIndex: base.cueIndex,
			cueCount,
			phase: base.phase,
			isPause: base.isPause,
			open: this.clamp(open),
			jaw: this.clamp(base.jaw * style.jaw * emotion.jaw * energy),
			width: this.clamp(base.width * style.width * emotion.width),
			round: this.clamp(base.round * style.round * emotion.round),
			press: this.clamp(
				base.press * (1 - base.release * 0.7) + emotion.press
			),
			teeth: this.clamp(base.teeth),
			tongue: this.clamp(base.tongue),
			tongueTip: this.clamp(base.tongueTip),
			bite: this.clamp(base.bite),
			closure,
			release: this.clamp(base.release),
			smile: this.clamp(emotion.smile + style.smile, -1, 1),
			cornerLift: this.clamp(
				emotion.smile * 0.7 + style.smile,
				-1,
				1
			),
			upperLift: this.clamp(base.teeth * 0.46 + open * 0.18),
			lowerDrop: this.clamp(base.jaw * 0.86 + open * 0.18),
			asymmetry,
			energy,
			envelope
		};
		return this.applyManual(result, input.manual || {});
	}

	static applyManual(result, manual) {
		const keys = [
			'open', 'jaw', 'width', 'round', 'press', 'teeth',
			'tongue', 'tongueTip', 'bite', 'closure', 'smile',
			'cornerLift', 'asymmetry'
		];
		for (const key of keys) {
			if (!Number.isFinite(Number(manual[key]))) {
				continue;
			}
			result[key] = this.clamp(
				Number(manual[key]),
				['smile', 'cornerLift', 'asymmetry'].includes(key) ? -1 : 0,
				1
			);
		}
		return result;
	}

	static asymmetry(input, isPause) {
		const seed = this.seed(String(input.id || input.speech || 'speech'));
		return Math.sin(
			Number(input.time || input.localTime || 0) * 0.0062
			+ seed * 0.00001
		) * 0.035 * (isPause ? 0 : 1);
	}

	static seed(text) {
		return [...String(text)].reduce((hash, character) => (
			Math.imul(hash ^ character.charCodeAt(0), 16777619) >>> 0
		), 2166136261);
	}

	static clamp(value, minimum = 0, maximum = 1) {
		return Math.min(maximum, Math.max(minimum, Number(value) || 0));
	}
}
