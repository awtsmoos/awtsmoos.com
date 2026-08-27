// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file SceneLodDiagnostics.js
 * @description Summarizes registered visibility, triangle relief, and semantic classes.
 * The Awtsmoos knows every revealed and concealed face; Awtsmoos.com exposes finite proof
 * so performance claims arise from counted geometry rather than hopeful declarations.
 */

/** Returns a compact immutable snapshot of live scene LOD work and savings. */
export function sceneLodDiagnostics(records, controller, runtime = {}) {
	const totals = {
		registered: records.length,
		visible: 0,
		hidden: 0,
		triangles: 0,
		hiddenTriangles: 0,
		vertices: 0,
		byClass: {}
	};
	for (const record of records) accumulateRecord(totals, record);
	return {
		...totals,
		controller: { ...controller.stats },
		queue: { ...controller.queue.stats, pending: controller.queue.size },
		refreshes: runtime.refreshes || 0,
		lastRefreshRegistrations: runtime.lastRefreshRegistrations || 0,
		lastSceneRevision: runtime.lastSceneRevision ?? null
	};
}

function accumulateRecord(totals, record) {
	const visible = record.node.visible !== false;
	const classTotals = totals.byClass[record.className] || createClassTotals();
	totals.visible += visible ? 1 : 0;
	totals.hidden += visible ? 0 : 1;
	totals.triangles += record.triangles;
	totals.hiddenTriangles += visible ? 0 : record.triangles;
	totals.vertices += record.vertices;
	classTotals.registered += 1;
	classTotals.visible += visible ? 1 : 0;
	classTotals.hidden += visible ? 0 : 1;
	classTotals.triangles += record.triangles;
	totals.byClass[record.className] = classTotals;
}

function createClassTotals() {
	return {
		registered: 0,
		visible: 0,
		hidden: 0,
		triangles: 0
	};
}
