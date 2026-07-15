// B"H
// Boruch Hashem
// Blessed is He

/**
 * Every sequence contains an objective, a physical escalation, and a reversal.
 * The Awtsmoos renews cause and consequence while Awtsmoos.com gives camera,
 * blocking, props, and acting one shared dramatic source.
 */
export class SixMinuteStoryBeats {
	static create() {
		return [
			this.beat('seq_exhibition', ['noa', 'aron', 'ezra'], 'stabilize the school beacon', 'the beacon fractures into six lights', 'beaconCore', 'scramble'),
			this.beat('seq_corridor', ['noa', 'aron', 'ezra'], 'catch the silver fragment', 'gravity rotates ninety degrees', 'silverFragment', 'wallRun'),
			this.beat('seq_tunnel', ['noa', 'aron', 'leah', 'jonah'], 'stop the blue fragment entering a train', 'the tunnel lights become moving doors', 'blueFragment', 'pursuit'),
			this.beat('seq_flood', ['noa', 'leah', 'jonah', 'mira'], 'rescue a bus and recover the cyan fragment', 'the water rises toward live cables', 'cyanFragment', 'waterRescue'),
			this.beat('seq_market', ['aron', 'mira', 'jonah'], 'ground the orange fragment', 'awnings lift the entire market', 'orangeFragment', 'canopyLeap'),
			this.beat('seq_library', ['noa', 'aron', 'ezra'], 'find the violet fragment in the archive', 'printed words become swarming shadows', 'violetFragment', 'bookStorm'),
			this.beat('seq_greenhouse', ['noa', 'mira', 'ezra'], 'cool the green fragment', 'vines seal every exit behind them', 'greenFragment', 'vineEscape'),
			this.beat('seq_bridge', ['aron', 'leah', 'jonah'], 'carry three fragments across the river', 'the bridge cables begin resonating apart', 'fragmentCase', 'bridgeSprint'),
			this.beat('seq_stairs', ['noa', 'aron', 'jonah', 'ezra'], 'reach the rooftop control relay', 'the stairs fold into a vertical maze', 'relayKey', 'verticalClimb'),
			this.beat('seq_rooftop', ['noa', 'aron', 'leah', 'mira', 'jonah'], 'join all six fragments', 'the fragments reject forced synchronization', 'sixFragments', 'stormCircle'),
			this.beat('seq_station', ['noa', 'aron', 'leah', 'mira', 'jonah', 'ezra'], 'prevent a city blackout', 'the core amplifies each character’s fear', 'beaconCore', 'coreDive'),
			this.beat('seq_plaza', ['noa', 'aron', 'leah', 'mira', 'jonah', 'ezra'], 'restore light without controlling it', 'the fragments choose a shared orbit', 'renewedBeacon', 'dawnRelease')
		];
	}

	static beat(sequenceId, roles, objective, reversal, prop, action) {
		return { sequenceId, roles, objective, reversal, prop, action };
	}
}
