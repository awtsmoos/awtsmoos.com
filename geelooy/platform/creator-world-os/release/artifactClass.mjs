// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module ArtifactClass
 * @description
 * Classifies normalized worktree matter so source, proof, generated output,
 * corpora, recordings, and builds never collapse into one release boundary.
 */

export const ARTIFACT_KINDS = Object.freeze([
	'source',
	'test',
	'documentation',
	'evidence',
	'generated',
	'corpus',
	'recording',
	'build-output'
]);

/** Classifies a repository path without reading its contents. */
export function classifyArtifact(pathname) {
	const path = normalizePath(pathname);
	const segments = path.split('/').filter(Boolean);
	if (isEvidence(path, segments)) {
		return 'evidence';
	}
	if (segments.includes('ai_thoughts') || /\.(md|txt)$/.test(path)) {
		return 'documentation';
	}
	if (/\.(test|spec)\.(mjs|cjs|js|ts)$/.test(path) || segments.includes('test') || segments.includes('tests')) {
		return 'test';
	}
	if (/\.(png|jpg|jpeg|webp|mp4|webm|wav|mp3)$/.test(path)) {
		return 'recording';
	}
	if (segments.includes('corpus') || /\.(hnsw|vectors?|embeddings?)$/.test(path)) {
		return 'corpus';
	}
	if (['dist', 'build', 'coverage'].some(segment => segments.includes(segment))) {
		return 'build-output';
	}
	if (segments.includes('generated')) {
		return 'generated';
	}
	return 'source';
}

/** Groups paths by artifact kind. */
export function groupArtifacts(paths) {
	return paths.reduce((groups, path) => {
		const kind = classifyArtifact(path);
		groups[kind] ||= [];
		groups[kind].push(path);
		return groups;
	}, {});
}

function isEvidence(path, segments) {
	return segments.includes('evidence') ||
		segments.includes('receipts') ||
		segments.includes('simulator-results') ||
		segments.includes('.reports') ||
		path.includes('frontier-line-markers') ||
		path.startsWith('browser-evidence') ||
		path.includes('screenshot') ||
		path.includes('receipt');
}

function normalizePath(value) {
	return String(value || '').trim().toLowerCase().replaceAll('\\', '/').replace(/^\.\//, '');
}
