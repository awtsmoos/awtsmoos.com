// B"H
// Boruch Hashem
// Blessed is He
/** Sampling reveals one finite value from the field sustained by the Awtsmoos. */

import { normalizeVector, scaleVector } from "../geometry/vectorMath.js";
import { sampleDeterministicNoise } from "./deterministicNoise.js";

function add(left, right) {
	if (Array.isArray(left)) return left.map((value, index) => value + right[index]);
	return left + right;
}

function multiply(left, right) {
	if (Array.isArray(left) && Array.isArray(right)) return left.map((value, index) => value * right[index]);
	if (Array.isArray(left)) return left.map(value => value * right);
	if (Array.isArray(right)) return right.map(value => left * value);
	return left * right;
}

function samplePrimitive(field, position, context) {
	const parameters = field.parameters;
	switch (field.kind) {
		case "constant": return parameters.value ?? (field.valueType === "vector" ? [0, 0, 0] : 0);
		case "position": return position;
		case "directional": return scaleVector(parameters.direction ?? [0, -1, 0], parameters.strength ?? 1);
		case "radial": {
			const center = parameters.center ?? [0, 0, 0];
			const delta = position.map((value, index) => value - center[index]);
			const distance = Math.hypot(...delta);
			const magnitude = (parameters.strength ?? 1) / (1 + distance * (parameters.falloff ?? 1));
			return field.valueType === "vector" ? scaleVector(normalizeVector(delta), magnitude) : magnitude;
		}
		case "vortex": {
			const center = parameters.center ?? [0, 0, 0];
			const tangent = [-(position[1] - center[1]), position[0] - center[0], 0];
			return scaleVector(normalizeVector(tangent), parameters.strength ?? 1);
		}
		case "noise": {
			const scale = parameters.scale ?? 1;
			const point = position.map(value => value * scale + (context.time ?? 0) * (parameters.speed ?? 0));
			const seed = parameters.seed ?? 1;
			if (field.valueType === "scalar") return sampleDeterministicNoise(point, seed);
			return [0, 1, 2].map(offset => sampleDeterministicNoise(point.map(value => value + offset * 17), seed + offset));
		}
		default: return null;
	}
}

function reductionIdentity(field) {
	if (field.valueType === "vector") {
		return field.kind === "add" ? [0, 0, 0] : [1, 1, 1];
	}
	return field.kind === "add" ? 0 : 1;
}

export function sampleField(field, context = {}, depth = 0) {
	if (depth > 32) throw new RangeError("Field recursion depth exceeded.");
	const position = context.position ?? [0, 0, 0];
	if (field.kind === "add" || field.kind === "multiply") {
		const values = field.children.map(child => sampleField(child, context, depth + 1));
		return values.reduce(field.kind === "add" ? add : multiply, reductionIdentity(field));
	}
	return samplePrimitive(field, position, context);
}
