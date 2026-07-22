// B"H
// Boruch Hashem
// Blessed is He
/** Every known Blender socket enters typed algebra; every unknown socket remains opaque. */

import { isNodeSocketType } from "../../nodes/socketTypes.js";

const DIRECT_TYPES = Object.freeze({
	bool: "boolean", boolean: "boolean", int: "integer", integer: "integer",
	float: "float", value: "float", vector: "vector", color: "color",
	rgba: "color", string: "string", shader: "shader", geometry: "geometry",
	object: "object", collection: "collection", image: "image", texture: "texture",
	material: "material", rotation: "rotation", matrix: "matrix", menu: "menu",
	bundle: "bundle", closure: "closure", volume: "volume"
});

const FIELD_TYPES = new Set([
	"boolean", "integer", "float", "angle", "distance", "factor", "time",
	"frequency", "wavelength", "temperature", "vector", "normal", "point",
	"direction", "translation", "velocity", "rotation", "color", "string", "menu"
]);

function subtypeType(subtype, fallback) {
	const normalized = String(subtype ?? "").toLowerCase();
	const map = {
		angle: "angle", distance: "distance", factor: "factor", percentage: "factor",
		time: "time", frequency: "frequency", wavelength: "wavelength",
		temperature: "temperature", normal: "normal", xyz: "vector",
		translation: "translation", direction: "direction", velocity: "velocity",
		rotation: "rotation", quaternion: "quaternion", color: "color"
	};
	return map[normalized] ?? fallback;
}

function explicitSemanticType(socket) {
	const type = socket.semanticType ?? socket.metadata?.semanticType;
	return isNodeSocketType(type) ? type : null;
}

export function mapBlenderSocketType(input) {
	const socket = typeof input === "string" ? { nativeType: input } : input ?? {};
	const nativeType = String(socket.nativeType ?? socket.blIdname ?? socket.type ?? "Opaque");
	const explicit = explicitSemanticType(socket);
	if (explicit) {
		return Object.freeze({
			type: socket.fieldCapable === true && !explicit.startsWith("field<")
				? `field<${explicit}>`
				: explicit,
			baseType: explicit,
			nativeType,
			field: socket.fieldCapable === true,
			opaque: explicit === "opaque"
		});
	}
	const stripped = nativeType
		.replace(/^NodeTreeInterfaceSocket/, "")
		.replace(/^NodeSocket/, "")
		.replace(/^GeometryNodeSocket/, "");
	const key = stripped.replace(/[^A-Za-z]/g, "").toLowerCase();
	let type = DIRECT_TYPES[key] ?? "opaque";
	if (key.includes("float")) type = subtypeType(socket.subtype, "float");
	if (key.includes("vector")) type = subtypeType(socket.subtype, "vector");
	if (key.includes("shader") && socket.shaderFamily) type = `shader.${socket.shaderFamily}`;
	const field = socket.fieldCapable === true && FIELD_TYPES.has(type);
	return Object.freeze({
		type: field ? `field<${type}>` : type,
		baseType: type,
		nativeType,
		field,
		opaque: type === "opaque"
	});
}
