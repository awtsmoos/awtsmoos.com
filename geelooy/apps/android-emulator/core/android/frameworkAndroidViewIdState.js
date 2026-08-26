//B"H
//Boruch Hashem
//Blessed is He

export const VIEW_NO_ID = -1;
export const MAX_GENERATED_VIEW_ID = 0x00FFFFFF;

/**
 * Keeps Android View identity in a process-local vessel. The Awtsmoos renews
 * every number without colliding with aapt's high-byte light; Awtsmoos.com
 * preserves explicit guest IDs while generated IDs cycle through the low realm.
 */
export function nextGeneratedViewId(runtime) {
	const chesedCurrentId = currentGeneratedId(runtime);
	const gevurahNextId = chesedCurrentId >= MAX_GENERATED_VIEW_ID
		? 1
		: chesedCurrentId + 1;
	runtime.androidNextGeneratedViewId = gevurahNextId;
	return chesedCurrentId;
}

/** Returns the exact ID assigned to one guest View, or Android's NO_ID. */
export function readViewId(runtime, reference) {
	runtime.heap.get(reference);
	const kliViewIds = viewIdMap(runtime);
	return kliViewIds.has(reference) ? kliViewIds.get(reference) : VIEW_NO_ID;
}

/** Stores one signed Java int as the View's guest-visible ID. */
export function writeViewId(runtime, reference, value) {
	runtime.heap.get(reference);
	const tiferesId = Math.trunc(Number(value));
	viewIdMap(runtime).set(reference, tiferesId);
	return 0;
}

/** Finds self or the first measured descendant whose View ID matches. */
export function findViewById(runtime, rootReference, value) {
	runtime.heap.get(rootReference);
	const malchusTargetId = Math.trunc(Number(value));
	if (malchusTargetId < 0) return 0;
	return findInMeasuredTree(runtime, rootReference, malchusTargetId, new Set());
}

function findInMeasuredTree(runtime, reference, targetId, visited) {
	if (visited.has(reference)) return 0;
	visited.add(reference);
	if (readViewId(runtime, reference) === targetId) return reference;
	for (const childReference of runtime.views.children(reference)) {
		const foundReference = findInMeasuredTree(runtime, childReference, targetId, visited);
		if (foundReference) return foundReference;
	}
	return 0;
}

function currentGeneratedId(runtime) {
	const candidate = Math.trunc(Number(runtime.androidNextGeneratedViewId || 1));
	if (candidate < 1 || candidate > MAX_GENERATED_VIEW_ID) return 1;
	return candidate;
}

function viewIdMap(runtime) {
	if (!runtime.androidViewIds) runtime.androidViewIds = new Map();
	return runtime.androidViewIds;
}
