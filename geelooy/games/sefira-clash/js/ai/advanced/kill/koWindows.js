//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the ko windows vessel in this instant, revealing
 * its focused js ai advanced kill service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * KO windows.
 *
 * Chapter 193: a fighter learns when damage has become death-pressure. Low
 * percent wants damage, mid percent wants carry, high percent wants launch, and
 * danger percent wants the heavens or the blast wall opened immediately.
 */
export function koWindow(target, world) {
	const damage = target.damage || 0;
	const edge = world.edgePressure || {};
	const bounds = world.map?.bounds || { left: -1200, right: 1200, top: -1000, bottom: 900 };
	const sideDistance = Math.min(
		Math.abs(target.x - bounds.left),
		Math.abs(bounds.right - target.x)
	);
	const verticalDistance = Math.abs(target.y - bounds.top);
	return {
		damage,
		low: damage < 45,
		mid: damage >= 45 && damage < 95,
		high: damage >= 95 && damage < 140,
		lethal: damage >= 140,
		edgeNear: edge.active || sideDistance < 280,
		sideDistance,
		verticalDistance,
		verticalKill: damage >= 120 && target.y < bounds.top + 620,
		horizontalKill: damage >= 105 && (edge.active || sideDistance < 360),
		carryNeeded: damage >= 45 && damage < 115 && sideDistance > 260
	};
}
