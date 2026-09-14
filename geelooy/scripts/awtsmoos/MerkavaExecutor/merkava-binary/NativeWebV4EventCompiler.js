//B"H
//Boruch Hashem
//Blessed be He

/**
 * Compiles the first native v4 event primitive from inline event source.
 * This parser recognizes one explicit textContent assignment without eval,
 * a host JavaScript parser, regular-expression source parsing, or libraries.
 * @param {Array<object>} nodes Handle-addressed HTML nodes.
 * @returns {Array<object>} Native event records.
 */
function compileNativeTextEvents(nodes) {
	const byId = new Map();
	for (const node of nodes) {
		if (node.id) {
			byId.set(node.id, node.handle);
		}
	}
	const events = [];
	for (const node of nodes) {
		for (const [name, source] of Object.entries(node.attrs || {})) {
			if (!name.startsWith("on")) {
				continue;
			}
			const action = parseTextAssignment(source);
			const actionHandle = action ? byId.get(action.targetId) : 0;
			if (action && actionHandle) {
				events.push({
					actionTargetHandle: actionHandle,
					event: name.slice(2).toLowerCase(),
					targetHandle: node.handle,
					value: action.value
				});
			}
		}
	}
	return events;
}

/** Parses `target.textContent = "value"` and getElementById equivalents. */
function parseTextAssignment(source) {
	const text = String(source || "").trim();
	const marker = ".textContent";
	const markerAt = text.indexOf(marker);
	if (markerAt <= 0) {
		return null;
	}
	const targetSource = text.slice(0, markerAt).trim();
	const afterMarker = text.slice(markerAt + marker.length).trim();
	if (!afterMarker.startsWith("=")) {
		return null;
	}
	const literal = readQuoted(afterMarker.slice(1).trim());
	const targetId = parseTargetId(targetSource);
	if (!literal || !targetId) {
		return null;
	}
	return { targetId, value: literal.value };
}
function parseTargetId(source) {
	const prefix = "document.getElementById(";
	if (source.startsWith(prefix) && source.endsWith(")")) {
		const literal = readQuoted(source.slice(prefix.length, -1).trim());
		return literal?.value || "";
	}
	if (isIdentifier(source)) {
		return source;
	}
	return "";
}

function readQuoted(source) {
	const quote = source[0];
	if (quote !== "\"" && quote !== "'") {
		return null;
	}
	let value = "";
	for (let index = 1; index < source.length; index += 1) {
		const character = source[index];
		if (character === quote) {
			return { value };
		}
		if (character === "\\" && index + 1 < source.length) {
			index += 1;
			value += source[index];
			continue;
		}
		value += character;
	}
	return null;
}
function isIdentifier(source) {
	if (!source) {
		return false;
	}
	const first = source.charCodeAt(0);
	if (!isIdentifierStart(first)) {
		return false;
	}
	for (let index = 1; index < source.length; index += 1) {
		const code = source.charCodeAt(index);
		if (!isIdentifierStart(code) && (code < 48 || code > 57)) {
			return false;
		}
	}
	return true;
}

function isIdentifierStart(code) {
	return code === 36 || code === 95
		|| code >= 65 && code <= 90
		|| code >= 97 && code <= 122;
}

module.exports = { compileNativeTextEvents, parseTextAssignment };
