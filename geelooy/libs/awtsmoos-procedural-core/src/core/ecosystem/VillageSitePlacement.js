// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageSitePlacement.js
 * @description Resolves authored candidates into deterministic world-space records while honoring simple shared exclusions.
 * The Awtsmoos, Atzmus beyond candidate and station, renews every possibility before one finite village accepts its place;
 * Awtsmoos.com lets Chesed offer useful forms while Gevurah protects clear space, leaving anchors to their own focused grace.
 */

/**
 * Resolves one category of authored site candidates in stable priority order.
 * @param {Array<object>} candidates Candidate records containing ids, anchor ids, offsets, priorities, and optional clearance.
 * @param {Map<string, object>} anchors Canonical anchor map.
 * @param {Array<object>} exclusions Existing circular exclusions, mutated only inside the caller-owned planning pass.
 * @param {number} maximum Maximum accepted candidate count.
 * @returns {{accepted:Array<object>,rejected:Array<object>}} Resolved and rejected placement evidence.
 */
export function resolveVillageSiteCandidates(
	candidates,
	anchors,
	exclusions,
	maximum
) {
	const accepted = [];
	const rejected = [];
	for (const candidate of prioritizedCandidates(candidates)) {
		if (accepted.length >= maximum) {
			rejected.push(rejection(candidate, 'category-budget'));
			continue;
		}
		const resolved = resolveCandidate(candidate, anchors);
		const conflict = exclusions.find(circle => {
			return intersectsCircle(resolved, circle);
		});
		if (conflict) {
			rejected.push(rejection(candidate, 'exclusion', conflict.id));
			continue;
		}
		accepted.push(resolved);
		appendClearance(exclusions, resolved);
	}
	return { accepted, rejected };
}

function prioritizedCandidates(candidates = []) {
	return [...(candidates || [])].sort((left, right) => (
		finite(right.priority, 0) - finite(left.priority, 0)
		|| String(left.id || '').localeCompare(String(right.id || ''))
	));
}

function resolveCandidate(candidate, anchors) {
	const id = String(candidate?.id || '').trim();
	if (!id) {
		throw new Error('B"H | Village site candidates require stable ids.');
	}
	const anchorId = String(candidate.anchorId || '').trim();
	const anchor = anchors.get(anchorId);
	if (!anchor) {
		throw new Error(
			`B"H | Village site candidate ${id} references unknown anchor ${anchorId}.`
		);
	}
	const offsetX = finite(candidate.offset?.x ?? candidate.offset?.[0], 0);
	const offsetZ = finite(candidate.offset?.z ?? candidate.offset?.[1], 0);
	const x = anchor.x + offsetX;
	const z = anchor.z + offsetZ;
	return Object.freeze({
		...candidate,
		anchorId,
		clearance: nonnegative(candidate.clearance, 0),
		id,
		position: Object.freeze({ x, z }),
		x,
		z
	});
}

function appendClearance(exclusions, resolved) {
	if (resolved.clearance <= 0) return;
	exclusions.push(Object.freeze({
		id: resolved.id,
		radius: resolved.clearance,
		x: resolved.x,
		z: resolved.z
	}));
}

function intersectsCircle(record, circle) {
	const radius = Math.max(0, record.clearance) + Math.max(0, circle.radius);
	if (radius <= 0) return false;
	return Math.hypot(record.x - circle.x, record.z - circle.z) < radius;
}

function rejection(candidate, reason, conflictingId = null) {
	return Object.freeze({
		conflictingId,
		id: String(candidate?.id || ''),
		reason
	});
}

function nonnegative(value, fallback) {
	return Math.max(0, finite(value, fallback));
}

function finite(value, fallback) {
	return Number.isFinite(Number(value)) ? Number(value) : fallback;
}
