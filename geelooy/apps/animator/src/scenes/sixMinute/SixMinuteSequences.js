// B"H
// Boruch Hashem
// Blessed is He

/**
 * Twelve worlds carry the beacon from morning exhibition to dawn resolution.
 * The Awtsmoos renews every room, street, tunnel, storm, and horizon while
 * Awtsmoos.com records geography, weather, light, and dramatic responsibility.
 */
export class SixMinuteSequences {
	static create() {
		return [
			this.sequence('seq_exhibition', 'The Beacon Breaks Open', 0, 'interior', 'scienceExhibition', 'morning', 'clear', 'flashCut'),
			this.sequence('seq_corridor', 'Gravity Runs Down The Hall', 30000, 'interior', 'schoolCorridor', 'morning', 'electricalWind', 'whip'),
			this.sequence('seq_tunnel', 'The Blue Fragment Takes The Train', 60000, 'interior', 'subwayTunnel', 'midday', 'sparks', 'matchCut'),
			this.sequence('seq_flood', 'The Street Becomes A River', 90000, 'exterior', 'floodedStreet', 'midday', 'storm', 'splashCut'),
			this.sequence('seq_market', 'The Market Learns To Fly', 120000, 'exterior', 'marketCanopy', 'afternoon', 'gale', 'whip'),
			this.sequence('seq_library', 'Every Book Opens At Once', 150000, 'interior', 'libraryArchive', 'afternoon', 'shadowPulse', 'iris'),
			this.sequence('seq_greenhouse', 'Heat Grows A Glass Jungle', 180000, 'interior', 'glassGreenhouse', 'sunset', 'heatMist', 'dissolve'),
			this.sequence('seq_bridge', 'The Red Fragment Crosses The River', 210000, 'exterior', 'riverBridge', 'sunset', 'gale', 'smashCut'),
			this.sequence('seq_stairs', 'The Tower Refuses The Elevator', 240000, 'interior', 'towerStairwell', 'evening', 'emergency', 'strobeCut'),
			this.sequence('seq_rooftop', 'Six Lights Over The Gardens', 270000, 'exterior', 'rooftopGardens', 'night', 'storm', 'lightningCut'),
			this.sequence('seq_station', 'The City Holds Its Breath', 300000, 'interior', 'powerStation', 'night', 'overload', 'crashCut'),
			this.sequence('seq_plaza', 'Dawn Chooses Cooperation', 330000, 'exterior', 'dawnPlaza', 'dawn', 'clearing', 'craneReveal')
		];
	}

	static sequence(id, name, start, environmentType, environment, timeOfDay, weather, transition) {
		return { id, name, start, duration: 30000, environmentType, environment, timeOfDay, weather, transition };
	}
}
