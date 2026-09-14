//B"H
//Boruch Hashem
//Blessed be He
/**
 * @module ProjectDataStudioController
 * @description
 * Coordinates bounded collection reads and explicit document mutations while the
 * server remains authoritative for alias ownership, project scope, and payload limits.
 */

export function createProjectDataStudioController(options) {
	const { fields, editor, platformProvider, renderDocuments, selectDocument, setStatus } = options;
	let currentOffset = 0;
	return Object.freeze({ listDocuments, readKey, saveKey, deleteKey, chooseDocument });

	/** Loads one bounded document page for visual browsing. */
	async function listDocuments(offset = currentOffset) {
		currentOffset = Math.max(0, Number(offset) || 0);
		const result = await client().listDocuments(fields.path.value, 100, currentOffset);
		const database = result.database || {};
		const documents = database.documents || [];
		renderDocuments(documents, database);
		setStatus(`${database.returned ?? documents.length}/${database.total ?? documents.length} document(s) loaded${database.truncated ? "; bounded preview" : ""}.`, "success");
		return documents;
	}

	/** Reads one selected document from the project namespace. */
	async function readKey() {
		const key = required(fields.key, "Document key");
		const result = await client().readKey(key, fields.path.value);
		const document = { key, value: result.database?.value };
		chooseDocument(document);
		setStatus(`Loaded ${key}.`, "success");
		return document;
	}

	/** Persists the editor as strict JSON and refreshes the collection preview. */
	async function saveKey() {
		const key = required(fields.key, "Document key");
		const value = parseStudioJson(editor.value);
		await client().setKey(key, value, fields.path.value);
		chooseDocument({ key, value });
		setStatus(`Saved ${key}.`, "success");
		await listDocuments();
	}

	/** Deletes only the explicitly named project document after native confirmation. */
	async function deleteKey() {
		const key = required(fields.key, "Document key");
		if (!globalThis.confirm?.(`Delete project document “${key}”?`)) return;
		await client().deleteKey(key, fields.path.value);
		editor.value = "";
		selectDocument(null);
		setStatus(`Deleted ${key}.`, "success");
		await listDocuments();
	}

	/** @param {{key:string,value:unknown}} document Bounded document selected by the creator. */
	function chooseDocument(document) {
		fields.key.value = document.key;
		editor.value = formatStudioJson(document.value);
		selectDocument(document);
	}

	/** @returns {object} Authenticated same-origin project client. */
	function client() {
		const platform = platformProvider();
		if (!platform?.project) throw new Error("Project API is not available in this Drive session.");
		return platform.project(required(fields.alias, "Alias"), required(fields.project, "Project"));
	}
}

/** @param {string} source Strict JSON source. @returns {unknown} Parsed value. */
export function parseStudioJson(source) {
	const value = String(source || "").trim();
	if (!value) return null;
	try {
		return JSON.parse(value);
	} catch {
		throw new TypeError("Value must be valid JSON before it can be saved.");
	}
}

/** @param {unknown} value JSON-compatible value. @returns {string} Pretty JSON. */
export function formatStudioJson(value) {
	return JSON.stringify(value ?? null, null, 2);
}

/** @param {object} field Studio field. @param {string} label Human label. @returns {string} Required value. */
function required(field, label) {
	const value = field.value;
	if (!value) throw new TypeError(`${label} is required.`);
	return value;
}
