// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file StrategyPerformances.js
 * @description
 * Acting runs through the entire two-minute chase: sitting, pointing, sprinting, dodging, climbing, negotiating, settling, and reacting.
 * The Awtsmoos renews every bodily beat while Awtsmoos.com preserves pose, action,
 * emotion, gesture, gaze, and prop contact as separately editable production tracks.
 */

/** Builds layered performance clips spanning every one of the eight cinematic scenes. */
export class StrategyPerformances {
	/** @param {Function} id Character-role resolver. @returns {object[]} Editable performance clips. */
	static create(id) {
		const rows = [
			['perf_seated', 'pose', 'practicalParent', 0, 8500, 'Seated strategy posture', { pose: 'seated', prop: 'strategyFolder', interaction: 'hold' }],
			['perf_point', 'gesture', 'brainyKid', 8500, 5500, 'Point at moving page', { gesture: 'point', intensity: 0.8 }],
			['perf_launch', 'emotion', 'inventorParent', 10500, 6000, 'Briefing surprise into pursuit', { emotion: 'shocked', gaze: [0.6, 0] }],
			['perf_corridor_run', 'action', 'inventorParent', 15000, 15000, 'Fast corridor pursuit', { action: 'run', armSwing: 0.95, walkSpeed: 1.55 }],
			['perf_corridor_run_dov', 'action', 'practicalParent', 16000, 14000, 'Dov corridor run', { action: 'run', armSwing: 0.8, walkSpeed: 1.4 }],
			['perf_quip_annoyed', 'emotion', 'dryTalkingPet', 21000, 9000, 'Deadpan moving reaction', { emotion: 'annoyed', gaze: [-0.5, 0] }],
			['perf_market_dodge', 'action', 'brainyKid', 30000, 15000, 'Market weaving run', { action: 'run', lean: 0.25, walkSpeed: 1.65 }],
			['perf_market_wave', 'gesture', 'wildToddler', 33500, 8500, 'Pip waves through market', { gesture: 'wave', intensity: 0.95 }],
			['perf_market_direct', 'gesture', 'practicalParent', 37500, 6000, 'Dov points toward bridge', { gesture: 'point', intensity: 1 }],
			['perf_bridge_pursuit', 'action', 'inventorParent', 45000, 15000, 'Bridge sprint', { action: 'run', armSwing: 1, walkSpeed: 1.8 }],
			['perf_bridge_pursuit_nomi', 'action', 'brainyKid', 45500, 14500, 'Nomi bridge sprint', { action: 'run', armSwing: 0.75, walkSpeed: 1.7 }],
			['perf_bridge_worry', 'emotion', 'inventorParent', 50000, 5000, 'Mira catches breath', { emotion: 'concerned', posture: 'tired', gaze: [0.2, -0.2] }],
			['perf_greenhouse_settle', 'pose', 'inventorParent', 60000, 15000, 'Mira lowers into negotiation', { pose: 'grounded', posture: 'open' }],
			['perf_greenhouse_smile', 'emotion', 'inventorParent', 61500, 9000, 'Warm negotiating expression', { emotion: 'warm', listening: true }],
			['perf_fern_offer', 'prop', 'wildToddler', 68000, 6500, 'Pip offers a fern', { prop: 'fern', interaction: 'present' }],
			['perf_stair_climb', 'action', 'practicalParent', 75000, 15000, 'Dov climbs stairwell', { action: 'walk', armSwing: 0.8, walkSpeed: 1.35 }],
			['perf_calendar_lift', 'prop', 'practicalParent', 79000, 6500, 'Raise accountability calendar', { prop: 'calendar', interaction: 'lift' }],
			['perf_stair_point', 'gesture', 'brainyKid', 84500, 5000, 'Nomi signals stair reversal', { gesture: 'point', intensity: 0.9 }],
			['perf_rooftop_breathe', 'pose', 'inventorParent', 90000, 15000, 'Rooftop recovery stance', { pose: 'standing', breath: 0.85 }],
			['perf_rooftop_nod', 'gesture', 'practicalParent', 95500, 7000, 'Dov accepts truce', { gesture: 'nod', intensity: 0.65 }],
			['perf_rooftop_laugh', 'emotion', 'brainyKid', 98000, 7000, 'Nomi laughs in relief', { emotion: 'laughing', gaze: [0.35, -0.1] }],
			['perf_plaza_walk', 'action', 'inventorParent', 105000, 15000, 'Final dawn plaza walk', { action: 'walk', armSwing: 0.55, walkSpeed: 0.9 }],
			['perf_plaza_walk_dov', 'action', 'practicalParent', 105000, 15000, 'Dov final walk', { action: 'walk', armSwing: 0.5, walkSpeed: 0.85 }],
			['perf_plaza_surprise', 'emotion', 'practicalParent', 111000, 7000, 'Dov sees Tuesday shoes', { emotion: 'surprised', gaze: [0, 0.55] }],
			['perf_final_wave', 'gesture', 'wildToddler', 114000, 6000, 'Pip final wave', { gesture: 'wave', intensity: 0.7 }]
		];
		return rows.map((row) => this.performance(row, id));
	}

	/** @param {any[]} row Compact authored performance row. @param {Function} id Role resolver. @returns {object} Performance clip. */
	static performance(row, id) {
		return {
			id: row[0],
			type: row[1],
			characterId: id(row[2]),
			start: row[3],
			duration: row[4],
			name: row[5],
			payload: structuredClone(row[6]),
			sequenceId: this.sequence(row[3])
		};
	}

	/** @param {number} start Performance start time. @returns {string} Owning sequence ID. */
	static sequence(start) {
		if (start < 15000) return 'seq_briefing';
		if (start < 30000) return 'seq_corridor';
		if (start < 45000) return 'seq_market';
		if (start < 60000) return 'seq_bridge';
		if (start < 75000) return 'seq_greenhouse';
		if (start < 90000) return 'seq_stairwell';
		if (start < 105000) return 'seq_rooftop';
		return 'seq_plaza';
	}
}
