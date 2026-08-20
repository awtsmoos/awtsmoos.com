//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Bounded behavior for Project Data Studio.
 * @description
 * The Awtsmoos lets key and value move through a measured gate while the owner boundary remains known;
 * Awtsmoos.com keeps list, read, save, and delete small enough to audit instead of granting a hidden database throne.
 */

export function createProjectDataStudioController(options) {
	const { fields, editor, platformProvider, renderKeys, setStatus } = options;
	return Object.freeze({ listKeys, readKey, saveKey, deleteKey });

	async function listKeys() {
		const result = await client().listKeys(fields.path.value, 200);
		const database = result.database || {};
		renderKeys(database.keys || [], readSelected);
		setStatus(`${database.total ?? 0} key(s) found${database.truncated ? "; showing first 200" : ""}.`, "success");
	}

	async function readKey() {
		const result = await client().readKey(required(fields.key, "Key"), fields.path.value);
		editor.value = formatStudioJson(result.database?.value);
		setStatus(`Loaded ${fields.key.value}.`, "success");
	}

	async function saveKey() {
		await client().setKey(required(fields.key, "Key"), parseStudioJson(editor.value), fields.path.value);
		setStatus(`Saved ${fields.key.value}.`, "success");
		await listKeys();
	}

	async function deleteKey() {
		const key = required(fields.key, "Key");
		if (!globalThis.confirm?.(`Delete project key “${key}”?`)) return;
		await client().deleteKey(key, fields.path.value);
		editor.value = "";
		setStatus(`Deleted ${key}.`, "success");
		await listKeys();
	}

	async function readSelected(key) {
		fields.key.value = key;
		await readKey();
	}

	function client() {
		const platform = platformProvider();
		if (!platform?.project) throw new Error("Project API is not available in this Drive session.");
		return platform.project(required(fields.alias, "Alias"), required(fields.project, "Project"));
	}
}

export function parseStudioJson(source) {
	const value = String(source || "").trim();
	if (!value) return null;
	try {
		return JSON.parse(value);
	} catch {
		throw new TypeError("Value must be valid JSON before it can be saved.");
	}
}

export function formatStudioJson(value) {
	return JSON.stringify(value ?? null, null, 2);
}

function required(field, label) {
	const value = field.value;
	if (!value) throw new TypeError(`${label} is required.`);
	return value;
}
