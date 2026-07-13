//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the map specific rules vessel in this instant, revealing
 * its focused js maps service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Map-specific rule modifiers.
 *
 * Chapter 71: not every arena asks the same question. Pinball demands inward
 * collisions, Vast demands center gatherings, Bouncer demands vertical pursuit.
 */
export function mapRuleModifiers(map) {
	const id = map.id || '';
	if (id.includes('pinball'))
		return {
			inwardPull: 1.55,
			objectiveCooldownScale: 0.62,
			itemCenterBias: 1.3,
			edgeCarryScale: 0.72,
			storyTempo: 1.35
		};
	if (id.includes('vast'))
		return {
			inwardPull: 1.25,
			objectiveCooldownScale: 0.55,
			itemCenterBias: 1.45,
			edgeCarryScale: 0.65,
			storyTempo: 1.1
		};
	if (id.includes('bouncer'))
		return {
			inwardPull: 1.05,
			objectiveCooldownScale: 0.85,
			itemCenterBias: 1.0,
			edgeCarryScale: 0.9,
			storyTempo: 1.25
		};
	return {
		inwardPull: 1,
		objectiveCooldownScale: 1,
		itemCenterBias: 1,
		edgeCarryScale: 1,
		storyTempo: 1
	};
}

/**
 * Reveals the map rally point behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} map The map value entering this behavior.
 */
export function mapRallyPoint(map) {
	const zone = map.zones?.centerControl?.[0] || map.zones?.landingTrap?.[0];
	if (zone) return { x: zone.x, y: zone.y };
	return { x: (map.bounds.left + map.bounds.right) / 2, y: 300 };
}
