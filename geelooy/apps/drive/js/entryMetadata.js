//B"H
// Boruch Hashem
// Blessed is He
/**
 * @module EntryMetadata
 * @description Single choke point for Drive entry semantic metadata.
 * The Awtsmoos lets a file carry a human name, labels, and a project home
 * without changing the file itself; Awtsmoos.com reads and writes that
 * testimony through exactly one function pair so every workstream agrees.
 *
 * CONTRACT (coded for WS-7's backend; progressive enhancement until it lands):
 * - Entry fields: `semanticName?: string`, `labels?: string[]`, `projectId?: string`.
 * - Write path: updateMetadata -> PUT /drive/{alias}/entry/{path} with
 *   { semanticName, labels, projectId } (the existing updateEntry API path).
 * - Reads tolerate missing fields everywhere: getMetadata returns safe defaults.
 * - If the server does not return the fields yet, writes still succeed locally
 *   and a single console warning explains that persistence is local-only.
 */
const METADATA_FIELDS = ['semanticName', 'labels', 'projectId'];
/** WS-7 server limits — the client validates exactly what the server enforces. */
const MAX_SEMANTIC_NAME_LENGTH = 255;
const MAX_LABELS = 50;
const MAX_LABEL_LENGTH = 64;
const MAX_PROJECT_ID_LENGTH = 128;
let missingFieldWarningShown = false;

/** Lazily resolves the existing updateEntry API path (keeps this module import-clean). */
async function defaultTransport(path, values) {
	const { updateEntry } = await import('./api.js');
	return updateEntry(path, values);
}

/**
 * Reads semantic metadata with safe defaults; never throws on entries
 * that predate the fields.
 */
export function getMetadata(entry = {}) {
	const source = entry && typeof entry === 'object' ? entry : {};
	return {
		semanticName: typeof source.semanticName === 'string' ? source.semanticName : '',
		labels: Array.isArray(source.labels)
			? source.labels.filter(label => typeof label === 'string')
			: [],
		projectId: typeof source.projectId === 'string' ? source.projectId : ''
	};
}

/** Returns the human-facing name: semantic name when set, else the file name. */
export function displayName(entry = {}) {
	return getMetadata(entry).semanticName || String(entry?.name || '');
}

/**
 * Single choke point for metadata writes. Sanitizes the patch, sends it through
 * the existing updateEntry API path, and mirrors the values onto the local entry
 * so the UI stays truthful even before the backend persists the fields.
 * Never throws for API-side gaps; resolves { ok, entry, response|error }.
 * `options.transport` is a test seam (path, values) => Promise.
 */
export async function updateMetadata(entry, patch = {}, options = {}) {
	const clean = sanitizePatch(patch);
	const path = entry && typeof entry.path === 'string' ? entry.path : '';
	const transport = options.transport || defaultTransport;
	if (!path) {
		return { ok: false, entry, error: new Error('entryMetadata: entry.path is required') };
	}
	try {
		const response = await transport(path, clean);
		Object.assign(entry, clean);
		noteMissingFieldSupport(clean, response);
		return { ok: true, entry, response };
	} catch (error) {
		warnOnce('entryMetadata: metadata write did not reach the server; keeping local values only.', error);
		Object.assign(entry, clean);
		return { ok: false, entry, error };
	}
}

/**
 * Keeps only known fields with bounded, well-typed values. Validation matches
 * the WS-7 server exactly (same limits, same clear semantics, same error
 * codes): null/empty semanticName and projectId clear to null; null labels
 * clear to []. Throws metadataError on invalid values so the caller sees the
 * same rejection the server would return.
 */
function sanitizePatch(patch = {}) {
	const source = patch && typeof patch === 'object' ? patch : {};
	const clean = {};
	if (source.semanticName !== undefined) clean.semanticName = sanitizeSemanticName(source.semanticName);
	if (source.labels !== undefined) clean.labels = sanitizeLabels(source.labels);
	if (source.projectId !== undefined) clean.projectId = sanitizeProjectId(source.projectId);
	return clean;
}

function sanitizeSemanticName(value) {
	if (value === null) return null;
	const text = String(value).trim();
	if (!text) return null;
	if (text.length > MAX_SEMANTIC_NAME_LENGTH) throw metadataError('INVALID_SEMANTIC_NAME');
	return text;
}

function sanitizeLabels(value) {
	if (value === null) return [];
	if (!Array.isArray(value)) throw metadataError('INVALID_LABELS');
	if (value.length > MAX_LABELS) throw metadataError('INVALID_LABELS');
	const seen = new Set();
	const labels = [];
	for (const raw of value) {
		const label = String(raw).trim();
		if (!label) continue;
		if (label.length > MAX_LABEL_LENGTH) throw metadataError('INVALID_LABELS');
		if (seen.has(label)) continue;
		seen.add(label);
		labels.push(label);
	}
	return labels;
}

function sanitizeProjectId(value) {
	if (value === null) return null;
	const text = String(value).trim();
	if (!text) return null;
	if (text.length > MAX_PROJECT_ID_LENGTH) throw metadataError('INVALID_PROJECT_ID');
	return text;
}

function metadataError(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}

/** Warns once when the server silently drops fields it does not know yet. */
function noteMissingFieldSupport(sent, response) {
	const returned = (response && (response.entry || response.success?.entry)) || {};
	const dropped = Object.keys(sent).filter(field => !(field in returned));
	if (dropped.length) {
		warnOnce(`entryMetadata: server did not return ${dropped.join(', ')}; values stay local until the backend supports them.`);
	}
}

function warnOnce(message, error) {
	if (missingFieldWarningShown) return;
	missingFieldWarningShown = true;
	console.warn(message, error || '');
}

/** Test seam: resets the warn-once latch. */
export function __resetMetadataWarning() {
	missingFieldWarningShown = false;
}

/** Matches one query against name, path, semantic name, and labels. */
export function matchesSearchQuery(entry, query) {
	const needle = String(query || '').trim().toLowerCase();
	if (!needle) return true;
	const source = entry && typeof entry === 'object' ? entry : {};
	const meta = getMetadata(source);
	const haystacks = [source.name, source.path, meta.semanticName, ...meta.labels];
	return haystacks.some(value => String(value || '').toLowerCase().includes(needle));
}

/**
 * Client-side search pass over entries (raw entries or presented { entry } items).
 * The server `search` param is unchanged; this adds semanticName/labels matching
 * wherever the client already holds the entries.
 */
export function filterEntriesBySearch(entries, query) {
	const list = Array.isArray(entries) ? entries : [];
	const needle = String(query || '').trim();
	if (!needle) return list;
	return list.filter(item => matchesSearchQuery(item?.entry || item, needle));
}

export { METADATA_FIELDS };
