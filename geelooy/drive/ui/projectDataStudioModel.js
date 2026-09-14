//B"H
//Boruch Hashem
//Blessed be He
/**
 * @module ProjectDataStudioModel
 * @description
 * Derives searchable previews, inferred field shapes, and copyable browser API code
 * from bounded project documents without evaluating database values as JavaScript.
 */

/** @param {Array<object>} documents Bounded document records. @param {unknown} term Search text. @returns {Array<object>} Matching records. */
export function filterStudioDocuments(documents, term) {
	const needle = String(term || "").trim().toLowerCase();
	if (!needle) return [...documents];
	return documents.filter(document => searchableDocument(document).includes(needle));
}

/** @param {Array<object>} documents Bounded document records. @returns {Array<object>} Top-level inferred fields. */
export function inferStudioSchema(documents) {
	const fields = new Map();
	for (const document of documents) {
		if (!isRecord(document?.value)) continue;
		for (const [name, value] of Object.entries(document.value)) {
			const field = fields.get(name) || { name, count: 0, types: new Set() };
			field.count += 1;
			field.types.add(studioValueType(value));
			fields.set(name, field);
		}
	}
	return [...fields.values()]
		.map(field => ({ name: field.name, count: field.count, types: [...field.types].sort() }))
		.sort((left, right) => right.count - left.count || left.name.localeCompare(right.name));
}

/** @param {unknown} value Arbitrary JSON-compatible value. @returns {string} Stable visual type. */
export function studioValueType(value) {
	if (value === null) return "null";
	if (Array.isArray(value)) return "array";
	return typeof value === "object" ? "object" : typeof value;
}

/** @param {unknown} value Value shown in a compact grid cell. @returns {string} Human preview. */
export function studioValuePreview(value) {
	if (value === null) return "null";
	if (typeof value === "string") return value.length > 70 ? `${value.slice(0, 67)}…` : value;
	const encoded = JSON.stringify(value);
	return encoded.length > 90 ? `${encoded.slice(0, 87)}…` : encoded;
}

/** @param {{alias:string,project:string,path:string,key:string}} identity Current Studio identity. @returns {string} Copyable browser ESM-style snippet. */
export function studioApiSnippet(identity) {
	const alias = JSON.stringify(identity.alias || "your-alias");
	const project = JSON.stringify(identity.project || "your-project");
	const path = JSON.stringify(identity.path || "");
	const key = JSON.stringify(identity.key || "document-id");
	return [
		"// B\"H — same-origin authenticated Builder API",
		`const db = GeelooyPlatform.project(${alias}, ${project});`,
		`const collection = await db.listDocuments(${path}, 50);`,
		`const document = await db.readKey(${key}, ${path});`,
		`await db.setKey(${key}, { hello: \"Awtsmoos\" }, ${path});`
	].join("\n");
}

/** @param {object} document Document record. @returns {string} Lower-case searchable testimony. */
function searchableDocument(document) {
	let encoded = "";
	try {
		encoded = JSON.stringify(document?.value ?? null);
	} catch {}
	return `${document?.key || ""} ${encoded}`.toLowerCase();
}

/** @param {unknown} value Candidate object value. @returns {boolean} True only for non-array records. */
function isRecord(value) {
	return value !== null && typeof value === "object" && !Array.isArray(value);
}
