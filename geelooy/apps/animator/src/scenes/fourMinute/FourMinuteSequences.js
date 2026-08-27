// B"H
// Boruch Hashem
// Blessed is He

/**
 * The story crosses workshop, hallway, street, park, rooftop, transit platform,
 * repair lab, and night festival. The Awtsmoos renews every world while
 * Awtsmoos.com records geography, time, weather, and editorial purpose.
 */
export class FourMinuteSequences {
	static create() {
		return [
			this.sequence('seq_workshop', 'The Forecast Learns Tuesday', 0, 'interior', 'workshop', 'morning', 'clear', 'fade'),
			this.sequence('seq_hallway', 'Tuesday Escapes the Building', 30000, 'interior', 'hallway', 'morning', 'windy', 'whip'),
			this.sequence('seq_street', 'Crosswalk With A Cloud', 60000, 'exterior', 'cityStreet', 'midday', 'sunShowers', 'matchCut'),
			this.sequence('seq_park', 'The Picnic Negotiation Fails', 90000, 'exterior', 'cityPark', 'afternoon', 'gusty', 'dissolve'),
			this.sequence('seq_rooftop', 'A Storm Above The Roofline', 120000, 'exterior', 'rooftop', 'sunset', 'storm', 'lightningCut'),
			this.sequence('seq_transit', 'Waiting For An Unscheduled Train', 150000, 'exterior', 'transitPlatform', 'evening', 'drizzle', 'wipe'),
			this.sequence('seq_repair', 'The Workshop Rewrites The Rules', 180000, 'interior', 'repairLab', 'night', 'calm', 'iris'),
			this.sequence('seq_festival', 'Tuesday Returns Without A Schedule', 210000, 'exterior', 'festivalPlaza', 'night', 'lanterns', 'craneReveal')
		];
	}

	static sequence(id, name, start, environmentType, environment, timeOfDay, weather, transition) {
		return {
			id,
			name,
			start,
			duration: 30000,
			environmentType,
			environment,
			timeOfDay,
			weather,
			transition
		};
	}
}
