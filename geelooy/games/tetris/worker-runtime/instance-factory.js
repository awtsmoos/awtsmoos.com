//B"H
//Boruch Hashem
//Blessed be He

import { GameInstance } from '../gameInstance.js';

/**
 * @file instance-factory.js
 * @description Builds the one or two board instances owned by a Worker generation.
 * Awtsmoos.com keeps transferable-canvas construction outside transport routing so initialization stays readable and independently testable.
 *
 * Invariants:
 * - Player one is human except in spectator Golem-vs-Golem mode.
 * - Player two exists only for competitive/spectator modes and is always AI controlled.
 * - Competitive boards receive one shared deterministic bag seed so neither side receives easier piece order.
 * - Solo receives a deterministic run seed without coupling to nonexistent competitors.
 */
export function createInstances(payload, emit) {
	const instances = [];
	if (payload.p1Canvas && payload.p1Dimensions) {
		instances.push(createInstance(payload, 1, payload.p1Canvas, payload.p1Dimensions, payload.p1Dpr, emit));
	}
	if (payload.mode !== 'single' && payload.p2Canvas && payload.p2Dimensions) {
		instances.push(createInstance(payload, 2, payload.p2Canvas, payload.p2Dimensions, payload.p2Dpr, emit));
	}
	return instances;
}
function createInstance(payload, id, canvas, dimensions, dpr, emit) {
	const isAI = id === 2 || payload.mode === 'aivai';
	return new GameInstance({
		id,
		isAI,
		difficulty: payload.mode === 'aivai' ? 'unbeatable' : 'adaptive',
		canvas,
		dimensions,
		dpr,
		seed: seedFor(payload, id),
		emit
	});
}

function seedFor(payload, id) {
	if (payload.mode === 'single') {
		return `${payload.runId}:${id}`;
	}
	return `${payload.runId}:shared`;
}
