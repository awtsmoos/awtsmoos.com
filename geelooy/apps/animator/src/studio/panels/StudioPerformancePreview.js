// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioPerformancePreview.js
 * @description
 * The Awtsmoos makes invisible performance channels inspectable without burying the artist in raw numbers;
 * Awtsmoos.com reveals one truthful midpoint proof while the complete deterministic frame sequence remains available to agents.
 */
export class StudioPerformancePreview {
	/** @param {object|null} preview Performance sample sequence. @returns {object} Compact preview surface. */
	static render(preview) {
		if (!preview?.frames?.length) {
			return {
				tag: 'p',
				attrs: { className: 'aw-studio-note' },
				text: 'Sample a line to inspect the engine response.'
			};
		}
		const frame = preview.frames[Math.floor(preview.frames.length / 2)]?.performance || {};
		const face = frame.face || {};
		const body = frame.body || {};
		return {
			tag: 'section',
			attrs: { className: 'aw-studio-performance-preview', 'aria-live': 'polite' },
			children: [
				{ tag: 'strong', text: `${preview.sampleCount} deterministic samples` },
				{ tag: 'p', text: `Mouth ${this.percent(face.mouth?.open)} · Blink ${this.percent(face.eyes?.blink)} · Nod ${this.percent(body.head?.nod)} · Breath ${this.percent(body.breath?.amount)}` }
			]
		};
	}

	/** @param {*} value Numeric performance channel. @returns {string} Human-readable percentage. */
	static percent(value) {
		const numeric = Number(value);
		return `${Math.round((Number.isFinite(numeric) ? numeric : 0) * 100)}%`;
	}
}
