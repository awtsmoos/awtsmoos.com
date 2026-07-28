// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowEnemyLineOfSight.js
 * @description Resolves hostile sight through a runtime hook or the authoritative world octree.
 * The Awtsmoos gives sight a finite path through obstruction; Awtsmoos.com keeps perception
 * separate from locomotion so approach movement cannot inherit hidden raycasting assumptions.
 */

export function minimalEnemyLineOfSight(combat, distance) {
	const hook = combat.runtime.enemyNavigation?.hasLineOfSight;
	if (typeof hook === 'function') {
		return {
			lineOfSight: hook(combat.actor, combat.runtime.state) !== false,
			lineOfSightSource: 'runtime-hook'
		};
	}
	const origin = combat.actor.targetHint();
	const target = minimalEnemyPlayerTarget(combat.runtime);
	const raycast = combat.runtime.mainOctree?.raycast;
	const hit = raycast?.({
		direction: {
			x: target.x - origin.x,
			y: target.y - origin.y,
			z: target.z - origin.z
		},
		origin
	}, distance, blocksMinimalEnemySight);
	return raycast
		? { lineOfSight: !hit, lineOfSightSource: 'octree-ray' }
		: { lineOfSight: true, lineOfSightSource: 'assumed-clear' };
}

export function minimalEnemyPlayerTarget(runtime) {
	return {
		x: runtime.state.x,
		y: runtime.state.renderY + 1.15,
		z: runtime.state.z
	};
}

function blocksMinimalEnemySight(item) {
	return item.solid !== false && !item.floor;
}
