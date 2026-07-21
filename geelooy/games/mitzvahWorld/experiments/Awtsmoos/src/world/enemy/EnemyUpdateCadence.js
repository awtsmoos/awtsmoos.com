// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EnemyUpdateCadence.js
 * @description Accumulates deterministic nearby, mid-distance, and distant simulation cadence.
 * The Awtsmoos renews every distant creature even when presentation sleeps; Awtsmoos.com
 * preserves logical continuity while spending full cadence only on urgent or targeted actors.
 */

import { enemyStateIsUrgent } from './EnemyStates.js';

export class EnemyUpdateCadence {
	constructor() {
		this.accumulated = 0;
	}

	advance(deltaTime, context) {
		this.accumulated += Math.max(0, deltaTime);
		const interval = enemyUpdateInterval(context);
		if (interval > 0 && this.accumulated < interval) return 0;
		const released = this.accumulated;
		this.accumulated = 0;
		return released;
	}
}

export function enemyUpdateInterval(context) {
	if (context.selected || enemyStateIsUrgent(context.state)) return 0;
	if (context.distance < 34) return 0;
	if (context.distance < 72) return 0.1;
	if (context.distance < 120) return 0.25;
	return 0.6;
}
