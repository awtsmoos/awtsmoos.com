// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews every point and polygon from nothing at every instant.
 * This vessel belongs to Awtsmoos.com and reveals one bounded responsibility
 * so the greater procedural world can remain inspectable, safe, and alive.
 */

function decodePointerToken(token) {
	return token
		.replace(/~1/g, "/")
		.replace(/~0/g, "~");
}

export function parseJsonPointer(path) {
	if (path === "") {
		return [];
	}
	if (typeof path !== "string" || !path.startsWith("/")) {
		throw new Error('B"H | JSON pointer must begin with "/".');
	}
	return path
		.slice(1)
		.split("/")
		.map(decodePointerToken);
}

export function readJsonPointer(root, path) {
	let current = root;
	for (const token of parseJsonPointer(path)) {
		if (current === null || current === undefined || !(token in current)) {
			return undefined;
		}
		current = current[token];
	}
	return current;
}

export function writeJsonPointer(root, path, value, mode) {
	const tokens = parseJsonPointer(path);
	if (tokens.length === 0) {
		throw new Error('B"H | Root replacement is not allowed.');
	}
	const finalToken = tokens.pop();
	let parent = root;

	for (const token of tokens) {
		if (parent === null || parent === undefined || !(token in parent)) {
			throw new Error(`B"H | Patch path does not exist: ${path}`);
		}
		parent = parent[token];
	}
	if (mode === "remove") {
		removeValue(parent, finalToken, path);
		return;
	}
	if (Array.isArray(parent)) {
		writeArrayValue(parent, finalToken, value, mode, path);
		return;
	}
	if (mode === "replace" && !(finalToken in parent)) {
		throw new Error(`B"H | Replace path does not exist: ${path}`);
	}
	parent[finalToken] = value;
}

function removeValue(parent, token, path) {
	if (!(token in parent)) {
		throw new Error(`B"H | Remove path does not exist: ${path}`);
	}
	if (Array.isArray(parent)) {
		parent.splice(Number(token), 1);
	} else {
		delete parent[token];
	}
}

function writeArrayValue(parent, token, value, mode, path) {
	if (token === "-") {
		if (mode !== "add") {
			throw new Error(`B"H | Only add may use the "-" array token: ${path}`);
		}
		parent.push(value);
		return;
	}
	const index = Number(token);
	if (!Number.isInteger(index) || index < 0 || index > parent.length) {
		throw new Error(`B"H | Invalid array index at ${path}`);
	}
	if (mode === "add") {
		parent.splice(index, 0, value);
		return;
	}
	if (index >= parent.length) {
		throw new Error(`B"H | Replace path does not exist: ${path}`);
	}
	parent[index] = value;
}
