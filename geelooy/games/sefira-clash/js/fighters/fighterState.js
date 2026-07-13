//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the fighter state vessel in this instant, revealing
 * its focused js fighters service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Fighter state is the momentary garment of a constantly renewed being.
 *
 * Chapter 58: the warrior receives real combat memory: jump buffers, air
 * dodges, combo counters, danger flags, and motion timers. These are not
 * features by themselves; they are vessels for feel.
 */
export function baseFighterState(seed, x, y, human, dna, stats) {
	return {
		id: seed,
		name: nameFrom(dna),
		human,
		dna,
		stats,
		x,
		y,
		prevY: y,
		vx: 0,
		vy: 0,
		face: 1,
		damage: 0,
		stocks: 3,
		dead: false,
		grounded: false,
		stun: 0,
		shield: stats.shield,
		blocking: false,
		heldWeapon: null,
		attack: null,
		attackFrame: 0,
		input: { x: 0, y: 0 },
		jumpsUsed: 0,
		extraJumps: 0,
		airDodge: 0,
		dodgeCooldown: 0,
		fastFalling: false,
		coyote: 0,
		jumpBuffer: 0,
		combo: { count: 0, timer: 0, lastTarget: null },
		danger: false,
		landingLag: 0,
		motionClock: 0,
		ai: { mode: 'seek', clock: 0 },
		bones: {},
		events: [],
		buffs: {}
	};
}

function nameFrom(dna) {
	return `${dna.sefirah[0].toUpperCase() + dna.sefirah.slice(1)} ${dna.weaponPreference}`;
}
