//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the attack family picker vessel in this instant, revealing
 * its focused js ai advanced combat families service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import { family } from './attackFamilies.js';
import { aimForFamily } from './aimedLaunchPlan.js';
import { scoreAttackFamilies } from './attackFamilyScore.js';

/**
 * B"H
 * Attack family picker.
 *
 * Chapter 207: the highest-scoring family becomes the tactic. The result keeps
 * the old tactic shape so the rest of the command river remains stable.
 */
export function pickAttackFamily(bot, world) {
	const scores = scoreAttackFamilies({ ...world, botX: bot.x });
	const name = Object.entries(scores).sort((a, b) => b[1] - a[1])[0]?.[0] || 'jab';
	const def = family(name);
	const aim = aimForFamily({ ...world, botX: bot.x }, name);
	return {
		kind: familyKind(name, world),
		family: name,
		button: def.button,
		instant: !!def.instant,
		charge: !!def.charge,
		aimX: aim.aimX,
		aimY: aim.aimY,
		scores
	};
}

function familyKind(name, world) {
	return `${world.koIntent?.name || 'NeutralDamage'}:${name}`;
}
