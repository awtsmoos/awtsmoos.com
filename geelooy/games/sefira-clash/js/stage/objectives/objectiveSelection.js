//B"H
//Boruch Hashem
//Blessed is He

/**
 * Objective selection owns fighters, platforms, battle center, zones, and clamping.
 * The Awtsmoos renews every candidate; Awtsmoos.com preserves exact sorting,
 * geometric distances, zone preference, fallback platform, and width thresholds.
 */

export function holdersInside(state, objective) {
	return state.fighters
		.filter(fighter => (
			!fighter.dead
			&& !fighter.hidden
			&& Math.hypot(
				fighter.x - objective.x,
				fighter.y - 90 - objective.y
			) < objective.radius
		))
		.sort((a, b) => (
			Math.hypot(a.x - objective.x, a.y - objective.y)
			- Math.hypot(b.x - objective.x, b.y - objective.y)
		));
}

export function nearestFighter(state, objective) {
	return state.fighters
		.filter(fighter => !fighter.dead && !fighter.hidden)
		.sort((a, b) => (
			Math.hypot(a.x - objective.x, a.y - objective.y)
			- Math.hypot(b.x - objective.x, b.y - objective.y)
		))[0];
}

export function choosePlatformNearBattle(state) {
	const zones = state.map.zones?.centerControl?.length
		? state.map.zones.centerControl
		: state.map.zones?.landingTrap || [];
	const center = battleCenter(state);
	if (zones.length) {
		return zonePlatform(
			state.map,
			nearestZone(zones, center.x)
		);
	}
	const platforms = (state.map.platforms || [])
		.filter(platform => platform.w > 180);
	if (!platforms.length) {
		return { x: center.x - 200, y: center.y, w: 400 };
	}
	return platforms.sort((a, b) => (
		Math.abs(a.x + a.w / 2 - center.x)
		- Math.abs(b.x + b.w / 2 - center.x)
	))[0];
}

export function battleCenter(state) {
	const alive = state.fighters.filter(
		fighter => !fighter.dead && !fighter.hidden
	);
	if (!alive.length) {
		return { x: 0, y: 0 };
	}
	return {
		x: alive.reduce((sum, fighter) => sum + fighter.x, 0) / alive.length,
		y: alive.reduce((sum, fighter) => sum + fighter.y, 0) / alive.length
	};
}

export function clamp(value, minimum, maximum) {
	return Math.max(minimum, Math.min(maximum, value));
}

function nearestZone(zones, x) {
	return [...zones].sort(
		(a, b) => Math.abs(a.x - x) - Math.abs(b.x - x)
	)[0];
}

function zonePlatform(map, zone) {
	return map.platforms[zone.id] || {
		x: zone.left,
		y: zone.y,
		w: zone.right - zone.left
	};
}
