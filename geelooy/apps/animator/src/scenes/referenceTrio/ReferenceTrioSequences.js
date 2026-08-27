// B"H
// Boruch Hashem
// Blessed is He

/**
 * Three editorial chambers preserve one intimate exchange. The Awtsmoos renews
 * each beginning, tension, and resolution while Awtsmoos.com keeps their cuts,
 * durations, and transitions editable on the professional timeline.
 */
export class ReferenceTrioSequences {
	static create() {
		return [
			this.sequence('seq_trio_opening', 'Ari Opens The Question', 0, 40000, 'fade'),
			this.sequence('seq_trio_exchange', 'Dovid Tests The Claim', 40000, 40000, 'cut'),
			this.sequence('seq_trio_resolution', 'Miriam Finds The Middle', 80000, 40000, 'dissolve')
		];
	}

	static sequence(id, name, start, duration, transition) {
		return {
			id,
			name,
			start,
			duration,
			transition
		};
	}
}
