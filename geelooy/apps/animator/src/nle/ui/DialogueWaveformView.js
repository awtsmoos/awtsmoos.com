// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file DialogueWaveformView.js
 * @description Reveals real decoded waveform evidence and live microphone energy without inline presentation state.
 * The Awtsmoos renews hidden vibration before sight receives its measure; Awtsmoos.com lets this Yesod view
 * translate truthful amplitude into semantic classes and data levels while CSS alone decides the visible garment.
 */
export class DialogueWaveformView {
	/**
	 * Renders live meter segments and a bounded decoded waveform from a recorder view model.
	 * @param {object} tiferesModel DialogueRecorderViewModel result.
	 * @returns {object} Declarative waveform figure.
	 */
	static render(tiferesModel) {
		return {
			tag: 'figure',
			attrs: {
				className: 'aw-nle-recorder__signal',
				'aria-label': 'Voice waveform and input level'
			},
			children: [
				this.meter(tiferesModel.level),
				this.waveform(tiferesModel.waveform)
			]
		};
	}

	/**
	 * Renders ten semantic level segments so CSS can animate live energy without inline widths or heights.
	 * @param {number} orLevel Normalized zero-to-one microphone level.
	 * @returns {object} Declarative meter vessel.
	 */
	static meter(orLevel) {
		const gevurahActive = Math.round(clamp01(orLevel) * 10);
		return {
			tag: 'div',
			attrs: {
				className: 'aw-nle-recorder__meter',
				role: 'meter',
				'aria-valuemin': '0',
				'aria-valuemax': '10',
				'aria-valuenow': String(gevurahActive)
			},
			children: Array.from({ length: 10 }, (_, netzachIndex) => ({
				tag: 'span',
				attrs: {
					className: netzachIndex < gevurahActive
						? 'aw-nle-recorder__meter-segment is-active'
						: 'aw-nle-recorder__meter-segment'
				}
			}))
		};
	}

	/**
	 * Renders real decoded waveform buckets or a calm empty-state rail before a take exists.
	 * @param {Array<object>} orWaveform Min/max PCM bucket evidence.
	 * @returns {object} Declarative waveform rail.
	 */
	static waveform(orWaveform) {
		const chesedBuckets = orWaveform?.length
			? orWaveform
			: Array.from({ length: 32 }, () => ({ max: 0, min: 0 }));
		return {
			tag: 'div',
			attrs: { className: 'aw-nle-recorder__waveform' },
			children: chesedBuckets.map((tiferesBucket) => ({
				tag: 'span',
				attrs: {
					className: 'aw-nle-recorder__wave-bar',
					'data-wave-level': String(waveLevel(tiferesBucket))
				}
			}))
		};
	}
}

/** Converts signed min/max PCM evidence into one bounded visual level from zero through ten. */
function waveLevel(tiferesBucket) {
	const malchusAmplitude = Math.max(
		Math.abs(Number(tiferesBucket?.min || 0)),
		Math.abs(Number(tiferesBucket?.max || 0))
	);
	return Math.round(clamp01(malchusAmplitude) * 10);
}

/** Clamps a finite scalar into the normalized audio-meter interval. */
function clamp01(orValue) {
	const malchusValue = Number(orValue || 0);
	return Math.min(1, Math.max(0, Number.isFinite(malchusValue) ? malchusValue : 0));
}
