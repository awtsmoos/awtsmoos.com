// B"H // Boruch Hashem // Blessed is He
/**
 * @file WorldChunkCollisionHandoff.js
 * @description Builds complete replacement maps only after geometric acceptance.
 * The Awtsmoos sustains parent ground until every child vessel is ready, while
 * Awtsmoos.com reveals one canonically ordered synchronous ownership transition.
 */
import { assertCollisionReplacementCoverage } from './WorldChunkCollisionCoverage.js';
import { activateWorldChunkCollisionEntry } from './WorldChunkCollisionEntry.js';
import { WORLD_CHUNK_COLLISION_STATES as C } from './WorldChunkCollisionState.js';
import { assertCollisionEventTime } from './WorldChunkCollisionValues.js';
/** Returns complete next maps for one validated atomic replacement group. */
export function prepareCollisionReplacement(activeEntries, preparedEntries, options = {}) {
	const { parentId, childIds, retainParent = true, handoffId, at = 0 } = options;
	const orderedIds = canonicalIds(childIds);
	const parent = requireActiveParent(activeEntries, parentId);
	const children = orderedIds.map((childId) => {
		const child = preparedEntries.get(childId);
		if (!child) {
			throw new Error(`Prepared collision child is missing: ${childId}`);
		}
		if (child.state !== C.VALIDATED) {
			throw new Error(`Collision child is not validated: ${childId}`);
		}
		if (child.parentId !== parentId) {
			throw new Error(`Collision child has the wrong parent: ${childId}`);
		}
		return child;
	});
	const coverage = assertCollisionReplacementCoverage(parent, children);
	const eventTime = assertCollisionEventTime(at);
	const nextActive = new Map(activeEntries);
	const nextPrepared = new Map(preparedEntries);
	for (const child of children) {
		nextActive.set(
			child.chunkId,
			activateWorldChunkCollisionEntry(child, handoffId, eventTime)
		);
		nextPrepared.delete(child.chunkId);
	}
	if (!retainParent) {
		nextActive.delete(parentId);
	}
	return {
		activeEntries: nextActive,
		preparedEntries: nextPrepared,
		handoff: freezeHandoff(
			parentId,
			orderedIds,
			retainParent,
			handoffId,
			eventTime,
			coverage
		)
	};
}
/** Returns the next active map after a fully covered retained parent retires. */
export function prepareCollisionParentRetirement(activeEntries, options = {}) {
	const { parentId, replacementIds, handoffId, at = 0 } = options;
	const orderedIds = canonicalIds(replacementIds);
	const parent = requireActiveParent(activeEntries, parentId);
	const replacements = orderedIds.map((replacementId) => {
		const replacement = activeEntries.get(replacementId);
		if (!replacement || replacement.parentId !== parentId) {
			throw new Error(`Active replacement does not cover parent: ${replacementId}`);
		}
		return replacement;
	});
	const coverage = assertCollisionReplacementCoverage(parent, replacements);
	const nextActive = new Map(activeEntries);
	nextActive.delete(parentId);
	return {
		activeEntries: nextActive,
		handoff: freezeHandoff(
			parentId,
			orderedIds,
			false,
			handoffId,
			at,
			coverage
		)
	};
}
function canonicalIds(values) {
	if (!Array.isArray(values) || values.length === 0) {
		throw new TypeError('Collision replacement IDs must be a nonempty array.');
	}
	if (values.some((value) => typeof value !== 'string')) {
		throw new TypeError('Collision replacement IDs must be strings.');
	}
	const unique = [...new Set(values)];
	if (unique.length !== values.length) {
		throw new Error('Collision replacement IDs must be unique.');
	}
	return unique.sort();
}
function requireActiveParent(activeEntries, parentId) {
	const parent = activeEntries.get(parentId);
	if (!parent) {
		throw new Error(`Active collision parent is missing: ${String(parentId)}`);
	}
	return parent;
}
function freezeHandoff(parentId, childIds, retainedParent, id, at, coverage) {
	if (typeof id !== 'string' || !id.trim()) {
		throw new TypeError('Collision handoff ID must be a nonempty string.');
	}
	return Object.freeze({
		id,
		parentId,
		childIds: Object.freeze([...childIds]),
		retainedParent,
		at: assertCollisionEventTime(at),
		coverage
	});
}
