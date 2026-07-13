#!/usr/bin/env node
//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the dive crush test vessel in this instant, revealing
 * its focused tools service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import { resolveStomps } from '../js/physics/special/stomp.js';

/** B"H - Direct regression test for timed intentional DOWN-plunge head crush. */
const stomper = fighter('stomper', 100, 360, {
	prevY: 210,
	vy: 15,
	diving: 12,
	diveIntent: true,
	diveAttackFrames: 18
});
const victim = fighter('victim', 108, 460, { prevY: 460, grounded: true });
const state = { frame: 123, fighters: [stomper, victim], events: [], hitstop: 0 };
resolveStomps(state);
const ok =
	victim.diveStunned === 420 &&
	victim.stun === 420 &&
	victim.diveCrushed?.by === 'stomper' &&
	state.diveStunPing?.victimId === 'victim' &&
	state.events.some(e => e.kind === 'diveCrush');
console.log(
	JSON.stringify(
		{
			ok,
			victim: {
				damage: victim.damage,
				stun: victim.stun,
				diveStunned: victim.diveStunned,
				diveCrushed: victim.diveCrushed
			},
			ping: state.diveStunPing,
			events: state.events
		},
		null,
		2
	)
);
if (!ok) process.exit(1);
function fighter(id, x, y, extra = {}) {
	return {
		id,
		name: id,
		x,
		y,
		prevY: y,
		vx: 0,
		vy: 0,
		damage: 0,
		stun: 0,
		stompGrace: 0,
		grounded: false,
		dead: false,
		airDodge: 0,
		face: 1,
		jumpsUsed: 1,
		...extra
	};
}
