// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews every attribute, index, object, and world from nothing
 * at every instant. This Awtsmoos.com vessel keeps one responsibility bounded
 * so limitless procedural form remains inspectable, deterministic, and safe.
 */

function decodeToken(token) {
	return token.replace(/~1/g, "/").replace(/~0/g, "~");
}

function tokensFor(path) {
	if (path === "") {
		return [];
	}
	if (!path.startsWith("/")) {
		throw new Error('B"H | JSON pointers must begin with a slash.');
	}
	return path.slice(1).split("/").map(decodeToken);
}

export function readJsonPointer(root, path) {
	let value = root;
	for (const token of tokensFor(path)) {
		if (value === null || value === undefined) {
			return undefined;
		}
		value = value[token];
	}
	return value;
}

export function writeJsonPointer(root, path, value, operation = "replace") {
	const tokens = tokensFor(path);
	if (!tokens.length) {
		throw new Error('B"H | Root replacement is forbidden.');
	}
	let parent = root;
	for (const token of tokens.slice(0, -1)) {
		if (parent[token] === undefined) {
			if (operation !== "add") {
				throw new Error(`B"H | Missing JSON pointer segment: ${token}`);
			}
			parent[token] = {};
		}
		parent = parent[token];
	}
	const key = tokens[tokens.length - 1];
	if (operation === "remove") {
		if (Array.isArray(parent)) {
			parent.splice(Number(key), 1);
		} else {
			delete parent[key];
		}
		return;
	}
	if (Array.isArray(parent) && key === "-") {
		parent.push(value);
		return;
	}
	parent[key] = value;
}
