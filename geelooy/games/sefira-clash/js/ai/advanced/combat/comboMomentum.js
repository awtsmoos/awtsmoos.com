//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the combo momentum vessel in this instant, revealing
 * its focused js ai advanced combat service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Combo momentum.
 *
 * Chapter 76: after a hit, the bot does not politely forget. It follows the
 * launched direction, tightens spacing, and tries to keep the sentence going
 * until the target escapes, danger interrupts, or the window expires.
 */
export function updateComboMomentum(bot, world) {
	bot.aiMind ||= {};
	bot.aiMind.comboMomentum ||= freshMomentum();
	const m = bot.aiMind.comboMomentum;
	const hitNow = world.target.damage > m.lastTargetDamage + 0.5;
	if (hitNow) startMomentum(m, bot, world);
	else stepMomentum(m, bot, world);
	m.lastTargetDamage = world.target.damage;
	return { ...m };
}

/**
 * Reveals the combo stand x behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} bot The bot value entering this behavior.
 * @param {*} world The world value entering this behavior.
 */
export function comboStandX(bot, world) {
	const m = bot.aiMind?.comboMomentum;
	if (!m?.active) return world.combatPocket?.standX ?? world.target.x;
	return world.target.x - Math.sign(m.launchDir || world.target.x - bot.x || 1) * 66;
}

function startMomentum(m, bot, world) {
	m.active = true;
	m.frames = 0;
	m.activations++;
	m.targetId = world.target.id;
	m.launchDir = Math.sign(world.target.vx || world.target.x - bot.x || bot.face || 1);
}

function stepMomentum(m, bot, world) {
	if (!m.active) return;
	m.frames++;
	const escaped = Math.hypot(world.target.x - bot.x, (world.target.y - bot.y) * 0.45) > 720;
	if (m.frames > 150 || escaped || world.danger?.score > 135) m.active = false;
}

function freshMomentum() {
	return {
		active: false,
		frames: 0,
		activations: 0,
		targetId: null,
		launchDir: 1,
		lastTargetDamage: 0
	};
}
