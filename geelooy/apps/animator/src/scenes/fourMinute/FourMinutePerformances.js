// B"H
// Boruch Hashem
// Blessed is He

/**
 * Speech moves through the entire person. The Awtsmoos renews face, breath,
 * posture, gesture, locomotion, and object contact together while Awtsmoos.com
 * preserves every beat as a separate editable timeline clip.
 */
export class FourMinutePerformances {
	static create(characters, dialogue) {
		const id = role => characters.find(character => character.role === role).identityId;
		return [
			...dialogue.map(line => this.emotion(line)),
			this.beat('seat_bench', 'pose', id('barak'), 0, 21000, 'Seated forecast review', { pose: 'seated', listening: true }),
			this.beat('hold_forecast', 'prop', id('talia'), 1800, 12000, 'Hold forecast tablet', { prop: 'forecastTablet', interaction: 'hold' }),
			this.beat('point_tuesday', 'gesture', id('sela'), 16800, 7000, 'Point at escaping Tuesday', { gesture: 'point', intensity: 1.1 }),
			this.beat('run_hallway', 'action', id('talia'), 30000, 30000, 'Run through the hallway', { action: 'run', speed: 1.4 }),
			this.beat('carry_umbrella', 'prop', id('barak'), 39000, 21000, 'Carry runaway umbrella', { prop: 'umbrella', interaction: 'carry' }),
			this.beat('street_walk', 'action', id('sela'), 60000, 30000, 'Cross the city street', { action: 'walk', speed: 1.1 }),
			this.beat('traffic_signal', 'prop', id('gideon'), 69300, 9000, 'Consult traffic signal', { prop: 'signalCard', interaction: 'lift' }),
			this.beat('park_seat', 'pose', id('ori'), 90000, 21000, 'Seated picnic negotiation', { pose: 'seated', listening: true }),
			this.beat('picnic_plan', 'prop', id('sela'), 99000, 9000, 'Arrange cancelled meeting cards', { prop: 'meetingCards', interaction: 'spread' }),
			this.beat('storm_crouch', 'pose', id('barak'), 120000, 18000, 'Crouch under rooftop storm', { pose: 'crouched', emotion: 'afraid' }),
			this.beat('gauge_lift', 'prop', id('barak'), 121800, 9000, 'Lift crying pressure gauge', { prop: 'pressureGauge', interaction: 'lift' }),
			this.beat('lightning_point', 'gesture', id('talia'), 129300, 9000, 'Direct lightning to antenna', { gesture: 'point', intensity: 1.5 }),
			this.beat('transit_seat', 'pose', id('gideon'), 150000, 21000, 'Sit at unscheduled platform', { pose: 'seated', listening: true }),
			this.beat('display_read', 'prop', id('sela'), 151800, 9000, 'Read whenever display', { prop: 'arrivalDisplay', interaction: 'read' }),
			this.beat('toolbox_carry', 'prop', id('talia'), 180000, 12000, 'Carry repair toolbox', { prop: 'toolbox', interaction: 'carry' }),
			this.beat('repair_work', 'action', id('barak'), 189000, 18000, 'Repair forecast machine', { action: 'repair', speed: 0.7 }),
			this.beat('nothing_button', 'prop', id('sela'), 196800, 9000, 'Install absolutely nothing button', { prop: 'nothingButton', interaction: 'press' }),
			this.beat('festival_dance', 'action', id('talia'), 210000, 30000, 'Festival dance through lanterns', { action: 'dance', speed: 1.1 }),
			this.beat('lantern_hold', 'prop', id('ori'), 219300, 12000, 'Hold moving lantern', { prop: 'lantern', interaction: 'hold' }),
			this.beat('free_time_card', 'prop', id('talia'), 232000, 7000, 'Raise the free-time calendar card', { prop: 'freeTimeCard', interaction: 'raise' }),
			this.beat('final_laugh', 'emotion', id('gideon'), 226800, 10000, 'Final relieved laugh', { emotion: 'laughing', gaze: [0.3, -0.1] })
		];
	}

	static emotion(line) {
		return this.beat(
			`emotion_${line.id}`,
			'emotion',
			line.speakerId,
			line.start,
			line.duration,
			`${line.speakerName} ${line.emotion}`,
			{ emotion: line.emotion, speechStyle: line.speechStyle, speaking: true }
		);
	}

	static beat(id, type, characterId, start, duration, name, payload) {
		return {
			id,
			type,
			characterId,
			start,
			duration,
			name,
			payload,
			sequenceId: this.sequence(start)
		};
	}

	static sequence(start) {
		const sequenceIds = [
			'seq_workshop',
			'seq_hallway',
			'seq_street',
			'seq_park',
			'seq_rooftop',
			'seq_transit',
			'seq_repair',
			'seq_festival'
		];
		return sequenceIds[Math.min(7, Math.floor(start / 30000))];
	}
}
