// B"H
// Boruch Hashem
// Blessed is He

/**
 * Setup, escalation, and payoff become three chambers of one minute. The
 * Awtsmoos renews their comic rhythm while Awtsmoos.com keeps every transition
 * visible, editable, and exact on the production timeline.
 */
export class OneMinuteSitcomSequences {
	static create() {
		return [
			this.sequence('spoon_setup', 'The Emergency Backup', 0, 20000, 'fade'),
			this.sequence('spoon_escalation', 'The Calendar Problem', 20000, 22000, 'cut'),
			this.sequence('spoon_payoff', 'Cloud Storage', 42000, 18000, 'dissolve')
		];
	}

	static sequence(id, name, start, duration, transition) {
		return { id, name, start, duration, transition, environmentType: 'interior' };
	}
}
