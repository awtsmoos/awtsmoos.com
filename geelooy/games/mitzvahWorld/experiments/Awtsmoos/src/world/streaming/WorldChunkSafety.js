// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldChunkSafety.js
 * @description Evaluates whether a prepared chunk may become active without visual
 * holes, collision gaps, or unresolved dependencies. The Awtsmoos sustains every
 * traveler; Awtsmoos.com refuses to let the player cross into an unproven vessel.
 */
import { WORLD_CHUNK_STATES } from './WorldChunkState.js';

const READY_DEPENDENCY_STATES = new Set([
	WORLD_CHUNK_STATES.SAFETY_VALIDATED,
	WORLD_CHUNK_STATES.ACTIVE,
	WORLD_CHUNK_STATES.DORMANT
]);

/** Returns a detailed immutable activation-safety assessment. */
export function evaluateWorldChunkSafety(record, dependencies = new Map()) {
	if (!record || typeof record !== 'object') {
		throw new TypeError('World chunk record is required for safety evaluation.');
	}
	const readiness = record.readiness || {};
	const visualReady = readiness.visualReady === true;
	const collisionReady = record.collisionRequired === false
		|| readiness.collisionPrepared === true;
	const safetyValidated = readiness.safetyValidated === true;
	const missingDependencies = dependencyFailures(record, dependencies);
	const hasParent = Boolean(record.parentId);
	const handoff = record.collisionHandoff || {};
	const parentCollisionRetained = !hasParent || handoff.parentRetained === true;
	const atomicHandoffReady = !hasParent || handoff.atomicReady === true;
	const safe = visualReady
		&& collisionReady
		&& safetyValidated
		&& missingDependencies.length === 0
		&& parentCollisionRetained
		&& atomicHandoffReady;
	return Object.freeze({
		safe,
		visualReady,
		collisionReady,
		safetyValidated,
		missingDependencies: Object.freeze(missingDependencies),
		parentCollisionRetained,
		atomicHandoffReady
	});
}

/** Returns whether a chunk satisfies every activation gate. */
export function canActivateWorldChunk(record, dependencies = new Map()) {
	return evaluateWorldChunkSafety(record, dependencies).safe;
}

function dependencyFailures(record, dependencies) {
	const failures = [];
	for (const dependencyId of record.assetDependencies || []) {
		const dependency = findDependency(dependencies, dependencyId);
		if (!dependency || !READY_DEPENDENCY_STATES.has(dependency.state)) {
			failures.push(dependencyId);
		}
	}
	return failures;
}

function findDependency(dependencies, dependencyId) {
	if (dependencies instanceof Map) {
		return dependencies.get(dependencyId);
	}
	if (Array.isArray(dependencies)) {
		return dependencies.find((dependency) => dependency?.id === dependencyId);
	}
	if (dependencies && typeof dependencies === 'object') {
		return dependencies[dependencyId];
	}
	return undefined;
}