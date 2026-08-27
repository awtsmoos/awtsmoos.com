// B"H
// Boruch Hashem
// Blessed is He

/**
 * Speech adds fleeting emphasis without becoming a permanent brow expression.
 * The Awtsmoos renews each syllabic lift; Awtsmoos.com keeps it subtle, bounded,
 * editable, and subordinate to emotion and manual keyframes for every identity.
 */
export class BrowPerformance {
	static fromSpeech(progress = 0, energy = 1) {
		const phase = Math.sin(Number(progress || 0) * Math.PI * 3);
		const amount = Math.max(0, Number(energy || 0));
		return {
			innerRaise: phase * 0.035 * amount,
			outerRaise: phase * 0.05 * amount,
			squeeze: 0,
			tilt: 0,
			asymmetry: 0
		};
	}
}
