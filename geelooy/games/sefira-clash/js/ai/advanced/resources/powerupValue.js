//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the powerup value vessel in this instant, revealing
 * its focused js ai advanced resources service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * AI powerup value with denial and quiet-map pickup pressure.
 *
 * Chapter 68: a relic ignored is a story unwritten. During quiet, near items
 * become bait, denial, and momentum rather than decoration.
 */
export function powerupValue(bot, item, world = {}) {
	if (!item) return 0;
	const base = item.value || 40;
	const role = item.role || 'resource';
	const d = item.distance || 0;
	const quiet = Math.min(40, (world.combatHeat?.noDamageFrames || 0) * 0.08);
	const denial = enemyNearItem(bot, item, world) ? 34 : 0;
	const zone = itemZoneBonus(item, world);
	return Math.max(0, base + roleBonus(bot, role, world) + quiet + denial + zone - d * 0.035);
}

function roleBonus(bot, role, world) {
	if (role === 'kill')
		return (world.target?.damage || 0) > 85 ? 55 : world.edgePressure?.active ? 30 : 0;
	if (role === 'chase')
		return Math.abs((world.target?.x || bot.x) - bot.x) > 520
			? 46
			: world.hunger?.starving
				? 30
				: 12;
	if (role === 'survive') return (bot.damage || 0) > 105 ? 62 : (bot.damage || 0) > 70 ? 32 : 4;
	if (role === 'recover')
		return world.danger?.offstage || bot.y > (world.map?.bounds?.bottom || 1200) - 250
			? 58
			: 14;
	if (role === 'pressure')
		return world.comboMomentum?.active ? 38 : world.hunger?.hungry ? 24 : 10;
	if (role === 'burst')
		return world.combatHeat?.killMode ? 48 : world.antiPeace?.active ? 34 : 14;
	return world.stageItem?.distance < 500 ? 28 : 10;
}

function enemyNearItem(bot, item, world) {
	return (world.state?.fighters || []).some(
		f =>
			f !== bot &&
			!f.dead &&
			!f.hidden &&
			Math.hypot(f.x - item.x, (f.y - item.y) * 0.5) < 280
	);
}

function itemZoneBonus(item, world) {
	const z = (world.mapZones?.zones || []).find(
		zone => item.x >= zone.left && item.x <= zone.right
	);
	if (!z) return 0;
	if (z.kind === 'centerControl') return 24;
	if (z.kind === 'landingTrap') return 18;
	return z.control * 1.2;
}
