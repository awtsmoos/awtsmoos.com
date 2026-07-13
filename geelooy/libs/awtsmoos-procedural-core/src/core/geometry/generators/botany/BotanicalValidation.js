// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BotanicalValidation.js
 * @description Tests every botanical vessel for finite, indexed, bounded form.
 * Honest geometry is a fitting dwelling for the truth of the Awtsmoos.
 */
export function validateBotanicalGeometry(payload) {
	const issues = [];
	if (!payload || !Array.isArray(payload.parts)) {
		return { ok: false, issues: ['payload:missing-parts'] };
	}
	for (const part of payload.parts) {
		issues.push(...partIssues(part));
	}
	if (payload.parts.length === 0) {
		issues.push('payload:empty');
	}
	return {
		ok: issues.length === 0,
		issues,
		stats: payload.stats,
		speciesId: payload.speciesId
	};
}

function partIssues(part) {
	const issues = [];
	const geometry = part.geometry || {};
	const vertices = geometry.vertices || [];
	const faces = geometry.faces || [];
	if (!part.role || !part.color) {
		issues.push('part:missing-material-key');
	}
	if (vertices.length === 0 || faces.length === 0) {
		issues.push(`${part.role || 'part'}:empty`);
	}
	for (const point of vertices) {
		if (!Array.isArray(point) || point.length !== 3 || !point.every(Number.isFinite)) {
			issues.push(`${part.role || 'part'}:invalid-vertex`);
			break;
		}
	}
	for (const face of faces) {
		if (!validFace(face, vertices.length)) {
			issues.push(`${part.role || 'part'}:invalid-face`);
			break;
		}
	}
	if (!boundsContainVertices(geometry.bounds, vertices)) {
		issues.push(`${part.role || 'part'}:invalid-bounds`);
	}
	return issues;
}

function validFace(face, vertexCount) {
	return Array.isArray(face)
		&& face.length === 3
		&& face.every((index) => Number.isInteger(index) && index >= 0 && index < vertexCount);
}

function boundsContainVertices(bounds, vertices) {
	if (!bounds || !Array.isArray(bounds.minimum) || !Array.isArray(bounds.maximum)) {
		return false;
	}
	return vertices.every((point) => point.every((value, axis) => (
		Number.isFinite(bounds.minimum[axis])
		&& Number.isFinite(bounds.maximum[axis])
		&& value >= bounds.minimum[axis] - 1e-9
		&& value <= bounds.maximum[axis] + 1e-9
	)));
}

export default validateBotanicalGeometry;
