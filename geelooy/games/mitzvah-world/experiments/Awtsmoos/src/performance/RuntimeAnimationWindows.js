// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RuntimeAnimationWindows.js
 * @description Preserves bounded percentile evidence for every animated world family.
 * The Awtsmoos renews every motion as one life; Awtsmoos.com gives door, model, NPC,
 * horse, and player matrix separate finite witnesses before any cadence is changed.
 */

import { FrameBudgetWindow } from './FrameBudgetWindow.js';

const FIELDS = Object.freeze({
	doors: 'doorsMilliseconds',
	horses: 'horsesMilliseconds',
	npcs: 'npcsMilliseconds',
	playerMatrix: 'playerMatrixMilliseconds',
	worldModels: 'worldModelsMilliseconds'
});

export class RuntimeAnimationWindows {
	constructor(options = {}) {
		const capacity = options.capacity || 600;
		this.windows = Object.fromEntries(
			Object.keys(FIELDS).map(name => [
				name,
				new FrameBudgetWindow({ capacity })
			])
		);
	}

	push(breakdown = {}) {
		for (const [name, field] of Object.entries(FIELDS)) {
			const value = breakdown[field];
			if (Number.isFinite(value) && value >= 0) {
				this.windows[name].push(Math.max(0.0001, value));
			}
		}
	}

	clear() {
		for (const window of Object.values(this.windows)) window.clear();
	}

	snapshot(totalAnimationMilliseconds = 0) {
		const costs = Object.fromEntries(
			Object.entries(this.windows).map(([name, window]) => [
				name,
				costSnapshot(window.snapshot(), totalAnimationMilliseconds)
			])
		);
		let dominantComponent = null;
		for (const name of Object.keys(costs)) {
			if (!dominantComponent
				|| costs[name].averageMilliseconds > costs[dominantComponent].averageMilliseconds) {
				dominantComponent = name;
			}
		}
		return { ...costs, dominantComponent };
	}
}

function costSnapshot(snapshot, totalAnimationMilliseconds) {
	return {
		averageMilliseconds: snapshot.averageIntervalMilliseconds,
		count: snapshot.count,
		p95Milliseconds: snapshot.p95IntervalMilliseconds,
		p99Milliseconds: snapshot.p99IntervalMilliseconds,
		ready: snapshot.ready,
		share: totalAnimationMilliseconds > 0
			? snapshot.averageIntervalMilliseconds / totalAnimationMilliseconds
			: 0
	};
}
