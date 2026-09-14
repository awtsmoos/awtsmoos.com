//B"H
//Boruch Hashem
//Blessed be He
/**
 * @module ProjectDataTransferModel
 * @description Normalizes portable Database Studio preview exports and bounded import documents without executing data.
 */

export const PROJECT_DATA_EXPORT_FORMAT = "awtsmoos-project-data-preview-v1";

/** @param {Array<object>} documents Loaded bounded documents. @param {object} identity Studio identity. @returns {object} Portable preview export. */
export function createProjectDataExport(documents, identity = {}) {
	return {
		format: PROJECT_DATA_EXPORT_FORMAT,
		exportedAt: new Date().toISOString(),
		collection: String(identity.path || ""),
		documents: documents.map(document => ({ key: String(document.key), value: document.value }))
	};
}

/** @param {unknown} payload Parsed JSON payload. @returns {Array<object>} Import document list. */
export function importDocumentsFromPayload(payload) {
	if (Array.isArray(payload?.documents)) return normalizeDocuments(payload.documents);
	if (record(payload) && !payload.format) {
		return normalizeDocuments(Object.entries(payload).map(([key, value]) => ({ key, value })));
	}
	throw new TypeError("Import JSON must be a Studio preview export or an object keyed by document id.");
}

/** @param {string} project Project id. @param {string} path Collection path. @returns {string} Safe browser filename. */
export function projectDataExportName(project, path) {
	const base = `${project || "project"}-${path || "root"}`.replace(/[^A-Za-z0-9._-]+/g, "-").replace(/^-+|-+$/g, "");
	return `${base || "project-data"}-preview.json`;
}

/** @param {Array<object>} documents Candidate document records. @returns {Array<object>} Normalized documents. */
function normalizeDocuments(documents) {
	return documents.map(document => {
		if (!record(document) || !String(document.key || "").trim()) throw new TypeError("Every imported document needs a key.");
		return { key: String(document.key).trim(), value: document.value };
	});
}

/** @param {unknown} value Candidate record. @returns {boolean} True for plain object-like values. */
function record(value) {
	return value !== null && typeof value === "object" && !Array.isArray(value);
}
