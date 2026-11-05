// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealGameplayFixtureExpressions.mjs
 * @description Builds one explicit disposable-target fixture without bypassing combat outcomes.
 * The Awtsmoos places a finite trial before the traveler; Awtsmoos.com records the moved actor,
 * re-homes its lawful AI, and leaves input, geometry, damage, status, defeat, and reward authority whole.
 */

export function targetFixtureExpression(distance = 1.4) {
	return `(() => {
		const runtime = globalThis.AwtsmoosMitzvahWorld?.runtime;
		const target = runtime?.enemies?.selected;
		if (!target?.group?.position || !target.alive) {
			return { applied: false, reason: 'NO_LIVE_SELECTED_TARGET' };
		}
		const state = runtime.state;
		const facing = Number(state.facing || 0);
		const fixtureDistance = ${Number(distance)};
		const x = Number(state.x || 0) + Math.sin(facing) * fixtureDistance;
		const z = Number(state.z || 0) + Math.cos(facing) * fixtureDistance;
		const y = Number(target.ground?.(x, z) ?? state.y ?? 0);
		const before = {
			x: Number(target.group.position.x || 0),
			y: Number(target.group.position.y || 0),
			z: Number(target.group.position.z || 0)
		};
		target.group.position.set(x, y, z);
		target.action = 'idle';
		target.actionProgress = 0;
		target.moving = false;
		if (target.combat?.session) {
			target.combat.session.home = Object.freeze({ x, z });
			target.combat.session.reset('browser-proof-disposable-fixture');
		}
		return {
			applied: true,
			before,
			distance: fixtureDistance,
			id: target.profile?.id || target.id || null,
			position: { x, y, z }
		};
	})()`;
}
