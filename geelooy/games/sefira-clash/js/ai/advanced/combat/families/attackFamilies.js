//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the attack families vessel in this instant, revealing
 * its focused js ai advanced combat families service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Attack family definitions.
 *
 * Chapter 202: buttons become families of intention. Rapid pressure, jab, kick,
 * charge, anti-air, meteor, and grab each declare the violence they serve.
 */
export const ATTACK_FAMILIES = Object.freeze({
	rapid: { family: 'rapid', button: 'rapidPunch', instant: true, range: 'close' },
	jab: { family: 'jab', button: 'punch', instant: true, range: 'close' },
	kick: { family: 'kick', button: 'kick', instant: true, range: 'mid' },
	chargePunch: { family: 'chargePunch', button: 'punch', charge: true, range: 'mid' },
	chargeKick: { family: 'chargeKick', button: 'kick', charge: true, range: 'mid' },
	antiAir: { family: 'antiAir', button: 'punch', instant: true, range: 'vertical' },
	meteor: { family: 'meteor', button: 'kick', instant: true, range: 'vertical' },
	grab: { family: 'grab', button: 'grab', instant: true, range: 'close' }
});

/**
 * Reveals the family behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} name The name value entering this behavior.
 */
export function family(name) {
	return ATTACK_FAMILIES[name] || ATTACK_FAMILIES.jab;
}
