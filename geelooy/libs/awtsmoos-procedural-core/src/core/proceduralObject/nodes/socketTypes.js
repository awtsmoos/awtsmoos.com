// B"H
// Boruch Hashem
// Blessed is He
/** Typed sockets let finite graph vessels connect without guessing hidden meaning. */

export const NODE_SOCKET_TYPES = Object.freeze([
	"boolean", "integer", "float", "angle", "distance", "factor",
	"vector", "normal", "point", "direction", "rotation", "matrix",
	"color", "spectrum", "string", "image", "texture", "object",
	"collection", "material", "geometry", "volume", "shader.surface",
	"shader.volume", "shader.emission", "shader.displacement"
]);

const FIELD_PATTERN = /^field<([a-z][a-z0-9._-]*)>$/i;

export function isNodeSocketType(value) {
	if (NODE_SOCKET_TYPES.includes(value)) return true;
	const match = typeof value === "string" ? value.match(FIELD_PATTERN) : null;
	return Boolean(match && NODE_SOCKET_TYPES.includes(match[1]));
}

export function assertNodeSocketType(value, label = "Socket type") {
	if (!isNodeSocketType(value)) throw new TypeError(`${label} is unsupported: ${value}`);
	return value;
}

export function unwrapFieldSocketType(value) {
	const match = typeof value === "string" ? value.match(FIELD_PATTERN) : null;
	return match ? match[1] : null;
}
