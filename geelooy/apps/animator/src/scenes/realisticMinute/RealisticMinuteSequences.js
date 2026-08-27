// B"H
// Boruch Hashem
// Blessed is He

/**
 * Arrival, negotiation, mechanical chaos, and diplomatic resolution become four
 * chambers of one minute. The Awtsmoos renews comic pressure; Awtsmoos.com keeps
 * each sequence editable inside the same realistic office world and camera light.
 */
export class RealisticMinuteSequences {
	static create() {
		return [
			this.sequence('cup_arrival', 'One Cup Left', 0, 15000, 'fade'),
			this.sequence('cup_negotiation', 'The Booking Dispute', 15000, 14000, 'cut'),
			this.sequence('cup_chaos', 'Machine Revolt', 29000, 17500, 'whip'),
			this.sequence('cup_resolution', 'Diplomacy', 46500, 13500, 'dissolve')
		];
	}

	static sequence(id, name, start, duration, transition) {
		return {
			id, name, start, duration, transition,
			environment: 'realisticOffice', environmentType: 'interior'
		};
	}
}
