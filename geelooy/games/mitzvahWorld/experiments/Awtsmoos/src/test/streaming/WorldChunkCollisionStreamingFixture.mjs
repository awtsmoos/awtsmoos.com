// B"H // Boruch Hashem // Blessed is He

/**
 * @file WorldChunkCollisionStreamingFixture.mjs
 * @description Builds production-style collision streaming around real child octrees.
 * The Awtsmoos reveals one ground through measured phases; Awtsmoos.com gives each
 * test fresh ownership, stable sequence time, and bounded generation evidence.
 */
import { WorldChunkCollisionStreamingRuntime } from '../../world/streaming/WorldChunkCollisionStreamingRuntime.js';
import {
	GENERATED_PARENT_BOUNDS,
	GENERATED_PARENT_ID
} from './WorldChunkCollisionGeneratedFixture.mjs';
import { createGeneratedHandoffFixture } from './WorldChunkCollisionGeneratedHandoffFixture.mjs';

const DEFAULT_TEST_GENERATION_UNITS = 4096;
const MAXIMUM_TEST_UPDATES = 100000;

/** Returns a fresh real-octree collision streaming fixture. */
export function createCollisionStreamingFixture({ generate, measure } = {}) {
	const base = createGeneratedHandoffFixture();
	const parentRecord = Object.freeze({
		id: GENERATED_PARENT_ID,
		bounds: GENERATED_PARENT_BOUNDS,
		deterministicSeed: 314159,
		generationVersion: 3,
		runtime: Object.freeze({
			terrain: Object.freeze({ colliders: base.triangles })
		})
	});
	const runtime = new WorldChunkCollisionStreamingRuntime({
		index: base.index,
		parentRecord,
		sourceTriangles: base.triangles,
		generate,
		measure: measure || fixedMeasurement
	});
	return Object.freeze({ ...base, parentRecord, runtime });
}

/** Requests and advances one fixture until the requested lifecycle state. */
export function advanceCollisionStreamingToState(
	fixture,
	targetState,
	{
		requestId = `streaming-${targetState}`,
		startAt = 10,
		maximumGenerationUnits = DEFAULT_TEST_GENERATION_UNITS,
		minimumObservationFrames = 1
	} = {}
) {
	if (!fixture.runtime.diagnostics().currentJob) {
		fixture.runtime.request({
			requestId,
			at: startAt,
			maximumGenerationUnits,
			minimumObservationFrames
		});
	}
	const receipts = [];
	let at = startAt + 1;
	while (fixture.runtime.diagnostics().currentJob.state !== targetState) {
		const receipt = fixture.runtime.update({ at, maximumGenerationUnits });
		receipts.push(receipt);
		at += 1;
		if (receipts.length > MAXIMUM_TEST_UPDATES) {
			throw new Error(`Collision streaming did not reach ${targetState}.`);
		}
		if (receipt.job?.terminal && receipt.state !== targetState) {
			throw new Error(`Collision streaming ended in ${receipt.state}.`);
		}
	}
	return Object.freeze({ at, receipts: Object.freeze(receipts) });
}

/** Advances one fixture through retained observation to retirement readiness. */
export function advanceCollisionStreamingToReady(
	fixture,
	requestId = 'streaming-ready'
) {
	return advanceCollisionStreamingToState(fixture, 'retirement-ready', { requestId });
}

function fixedMeasurement(operation) {
	return Object.freeze({ value: operation(), durationMs: 2.5 });
}
