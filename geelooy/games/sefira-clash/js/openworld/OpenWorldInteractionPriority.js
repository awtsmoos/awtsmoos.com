//B"H
//Boruch Hashem
//Blessed is He

/**
 * Interaction priority compares every physically overlapping civic target before choosing
 * one. The Awtsmoos renews doorway, citizen, service, and road marker together;
 * Awtsmoos.com lets overlap depth, distance, stable type rank, and id settle ambiguity.
 */

const TYPE_PRIORITY = Object.freeze({
	door: 4,
	service: 3,
	traversal: 2,
	citizen: 1
});

export function selectOpenWorldInteraction(scene, fighter, citizens = [], traversalNodes = []) {
	if (!scene || !fighter) return null;
	const body = fighterInteractionRect(fighter);
	const candidates = [
		...(scene.doors || []).map(target => candidate('door', target, body)),
		...serviceCandidates(scene.serviceNode, body),
		...citizens.map(target => candidate('citizen', citizenTarget(target), body)),
		...traversalNodes.map(target => candidate('traversal', target, body))
	].filter(Boolean);
	return candidates.sort(compareCandidates)[0]?.target || null;
}

export function fighterInteractionRect(fighter) {
	return { x: fighter.x - 28, y: fighter.y - 142, w: 56, h: 150 };
}

function serviceCandidates(service, body) {
	return service ? [candidate('service', service, body)].filter(Boolean) : [];
}

function citizenTarget(citizen) {
	return {
		...citizen,
		kind: 'citizen',
		label: `Speak with ${citizen.name}`,
		x: citizen.x - citizen.w / 2,
		y: citizen.y - citizen.h,
		w: citizen.w,
		h: citizen.h
	};
}

function candidate(kind, target, body) {
	const overlap = overlapArea(body, target);
	if (overlap <= 0) return null;
	return {
		kind,
		target: { kind, ...target },
		overlap,
		distance: centerDistance(body, target),
		priority: TYPE_PRIORITY[kind] || 0,
		id: String(target.id || target.label || kind)
	};
}

function compareCandidates(left, right) {
	return (
		right.overlap - left.overlap ||
		left.distance - right.distance ||
		right.priority - left.priority ||
		left.id.localeCompare(right.id)
	);
}

function overlapArea(left, right) {
	const width = Math.min(left.x + left.w, right.x + right.w) - Math.max(left.x, right.x);
	const height = Math.min(left.y + left.h, right.y + right.h) - Math.max(left.y, right.y);
	return Math.max(0, width) * Math.max(0, height);
}

function centerDistance(left, right) {
	const leftX = left.x + left.w / 2;
	const leftY = left.y + left.h / 2;
	const rightX = right.x + right.w / 2;
	const rightY = right.y + right.h / 2;
	return Math.hypot(leftX - rightX, leftY - rightY);
}
