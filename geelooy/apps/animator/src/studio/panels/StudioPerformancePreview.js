// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioPerformancePreview.js
 * @description
 * The Awtsmoos renews invisible acting channels before numbers can claim to describe a living gesture;
 * Awtsmoos.com reveals one compact midpoint witness while deterministic frames remain available to deeper tools and agents.
 */
export class StudioPerformancePreview {
	/**
	 * Renders a compact human-readable witness from the sampled performance sequence.
	 * @param {object|null} malchusPreview Performance sample receipt.
	 * @returns {object} Declarative preview or empty-state note.
	 */
	static render(malchusPreview) {
		if (!malchusPreview?.frames?.length) {
			return {
				tag: 'p',
				attrs: { className: 'aw-studio-note' },
				text: 'Sample a line to inspect the engine response.'
			};
		}
		const tiferesIndex = Math.floor(malchusPreview.frames.length / 2);
		const binahPerformance = malchusPreview.frames[tiferesIndex]?.performance || {};
		const chochmahFace = binahPerformance.face || {};
		const yesodBody = binahPerformance.body || {};
		return {
			tag: 'section',
			attrs: {
				className: 'aw-studio-performance-preview',
				'aria-live': 'polite'
			},
			children: [
				{
					tag: 'strong',
					text: `${malchusPreview.sampleCount} deterministic samples`
				},
				{
					tag: 'p',
					text: [
						`Mouth ${this.percent(chochmahFace.mouth?.open)}`,
						`Blink ${this.percent(chochmahFace.eyes?.blink)}`,
						`Nod ${this.percent(yesodBody.head?.nod)}`,
						`Breath ${this.percent(yesodBody.breath?.amount)}`
					].join(' · ')
				}
			]
		};
	}

	/**
	 * Formats one bounded performance channel as a human percentage.
	 * @param {*} orValue Numeric performance channel candidate.
	 * @returns {string} Rounded percentage text.
	 */
	static percent(orValue) {
		const gevurahNumeric = Number(orValue);
		const tiferesSafe = Number.isFinite(gevurahNumeric)
			? gevurahNumeric
			: 0;
		return `${Math.round(tiferesSafe * 100)}%`;
	}
}
