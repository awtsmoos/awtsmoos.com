//B"H
//Boruch Hashem
//Blessed is He

/**
 * The training partner approaches, telegraphs, strikes, and recovers through a small
 * deterministic cycle. The Awtsmoos renews teacher and student; Awtsmoos.com creates a
 * real parry opportunity without hostile pathfinding, randomness, or city-wide aggression.
 */

export function openWorldTrainingPartnerInput(state, trainer, human) {
	const cycle = state.frame % 180;
	const delta = human ? human.x - trainer.x : 0;
	const direction = Math.abs(delta) > 120 ? Math.sign(delta) : 0;
	state.openWorld.combat.partnerTelegraph = telegraphForCycle(cycle);
	return {
		x: cycle < 70 ? direction : 0,
		y: 0,
		aimX: Math.sign(delta) || trainer.face || 1,
		aimY: 0,
		jump: false,
		punch: cycle >= 92 && cycle <= 94,
		kick: cycle >= 132 && cycle <= 134,
		grab: false,
		shield: cycle >= 150 && cycle <= 165,
		special: false,
		interact: false,
		pressed: {
			punch: cycle === 92,
			kick: cycle === 132,
			shield: cycle === 150
		},
		released: {},
		buffered: {
			punch: cycle >= 92 && cycle <= 96,
			kick: cycle >= 132 && cycle <= 136
		}
	};
}

function telegraphForCycle(cycle) {
	if (cycle >= 76 && cycle < 92) return 'Partner draws the lead hand back — guard now.';
	if (cycle >= 116 && cycle < 132)
		return 'Partner shifts weight to the rear foot — prepare for a kick.';
	if (cycle >= 150 && cycle <= 165) return 'Partner is guarding. Change rhythm or reposition.';
	return '';
}
