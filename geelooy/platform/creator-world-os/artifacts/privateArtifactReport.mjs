// B"H
// Boruch Hashem
// Blessed is He
/** @module PrivateArtifactReport @description Keeps uploaded software private while sharing approved proof. */

/** Creates a private-by-default capability report. */
export function createPrivateArtifactReport(input) {
	const artifactHash = String(input?.artifactHash || '').trim();
	const format = String(input?.format || '').trim();
	if (!artifactHash || !format) {
		throw new TypeError('Artifact report requires artifactHash and format.');
	}
	return Object.freeze({
		id: input?.id || `artifact-report:${artifactHash.slice(0, 16)}`,
		artifactHash,
		format,
		architecture: input?.architecture || null,
		visibility: input?.visibility || 'private',
		capabilities: Object.freeze([...(input?.capabilities || [])]),
		traces: Object.freeze([...(input?.traces || [])]),
		unsupported: Object.freeze([...(input?.unsupported || [])]),
		approvedFields: Object.freeze([...(input?.approvedFields || [])]),
		createdAt: String(input?.createdAt || new Date().toISOString())
	});
}

/** Creates a public projection containing only explicitly approved fields. */
export function publicArtifactProjection(report) {
	const projection = {};
	for (const field of report?.approvedFields || []) {
		if (field in report) {
			projection[field] = report[field];
		}
	}
	return Object.freeze(projection);
}
