// B"H
// Boruch Hashem
// Blessed is He
/** Connection planning reveals compatibility, conversion, and loss before linking. */

import { assertNodeSocketType, unwrapFieldSocketType } from "./socketTypes.js";

const NUMERIC_TYPES = new Set([
	"boolean", "integer", "float", "angle", "distance", "factor",
	"time", "frequency", "wavelength", "temperature"
]);
const VECTOR_TYPES = new Set([
	"vector", "normal", "point", "direction", "translation",
	"velocity", "rotation", "quaternion", "color"
]);
const EXACT_TYPES = new Set([
	"string", "menu", "image", "texture", "object", "collection",
	"material", "geometry", "volume", "bundle", "closure", "opaque"
]);

function result(compatible, conversion = null, lossiness = "none", reason = null) {
	return Object.freeze({ compatible, conversion, lossiness, reason });
}

function planBaseConnection(outputType, inputType) {
	if (outputType === inputType) return result(true);
	if (outputType.startsWith("shader") || inputType.startsWith("shader")) {
		if (outputType === "shader" && inputType.startsWith("shader.")) {
			return result(true, `shader-to-${inputType}`, "contextual");
		}
		return result(false, null, "incompatible", "Shader closures require exact compatible families.");
	}
	if (EXACT_TYPES.has(outputType) || EXACT_TYPES.has(inputType)) {
		return result(false, null, "incompatible", `Cannot connect ${outputType} to ${inputType}.`);
	}
	if (NUMERIC_TYPES.has(outputType) && NUMERIC_TYPES.has(inputType)) {
		const lossy = outputType === "float" && ["integer", "boolean"].includes(inputType);
		return result(true, `${outputType}-to-${inputType}`, lossy ? "lossy" : "none");
	}
	if (NUMERIC_TYPES.has(outputType) && VECTOR_TYPES.has(inputType)) {
		return result(true, `${outputType}-broadcast-to-${inputType}`);
	}
	if (VECTOR_TYPES.has(outputType) && VECTOR_TYPES.has(inputType)) {
		return result(true, `${outputType}-reinterpret-as-${inputType}`, "contextual");
	}
	if (outputType === "spectrum" && inputType === "color") return result(true, "spectrum-to-color", "lossy");
	if (outputType === "color" && inputType === "spectrum") return result(true, "color-to-spectrum", "estimated");
	return result(false, null, "incompatible", `Cannot connect ${outputType} to ${inputType}.`);
}

export function planSocketConnection(outputSocket, inputSocket) {
	const outputType = assertNodeSocketType(outputSocket?.type, "Output socket type");
	const inputType = assertNodeSocketType(inputSocket?.type, "Input socket type");
	const outputField = unwrapFieldSocketType(outputType);
	const inputField = unwrapFieldSocketType(inputType);
	if (inputField && !outputField) {
		const base = planBaseConnection(outputType, inputField);
		return base.compatible
			? result(true, base.conversion ? `${base.conversion}-then-lift-field` : "lift-constant-to-field", base.lossiness)
			: base;
	}
	if (outputField && inputField) return planBaseConnection(outputField, inputField);
	if (outputField && !inputField) return result(false, null, "incompatible", "A field requires an evaluation context.");
	return planBaseConnection(outputType, inputType);
}
