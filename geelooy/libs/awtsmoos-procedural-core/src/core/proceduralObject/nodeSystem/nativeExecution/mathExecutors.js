// B"H
// Boruch Hashem
// Blessed is He
/** Scalar executors provide deterministic reference math and logic. */

function number(value, fallback = 0) {
	return Number.isFinite(Number(value)) ? Number(value) : fallback;
}

const OPERATIONS = Object.freeze({
	add: (a, b) => a + b,
	subtract: (a, b) => a - b,
	multiply: (a, b) => a * b,
	divide: (a, b) => b === 0 ? 0 : a / b,
	power: (a, b) => Math.pow(a, b),
	minimum: (a, b) => Math.min(a, b),
	maximum: (a, b) => Math.max(a, b),
	modulo: (a, b) => b === 0 ? 0 : ((a % b) + b) % b,
	absolute: (a) => Math.abs(a),
	floor: (a) => Math.floor(a),
	ceil: (a) => Math.ceil(a),
	fraction: (a) => a - Math.floor(a),
	sine: (a) => Math.sin(a),
	cosine: (a) => Math.cos(a),
	tangent: (a) => Math.tan(a),
	compare: (a, b, c) => Math.abs(a - b) <= Math.abs(c) ? 1 : 0
});

export function executeScalarMath(inputs = {}, config = {}) {
	const operation = String(config.operation ?? "add").toLowerCase();
	const executor = OPERATIONS[operation] ?? OPERATIONS.add;
	return Object.freeze({
		value: executor(
			number(inputs.a ?? inputs.value),
			number(inputs.b),
			number(inputs.c ?? inputs.epsilon, 0.001)
		)
	});
}

export function executeMapRange(inputs = {}, config = {}) {
	const value = number(inputs.value);
	const fromMinimum = number(inputs["from-min"] ?? inputs.fromMin);
	const fromMaximum = number(inputs["from-max"] ?? inputs.fromMax, 1);
	const toMinimum = number(inputs["to-min"] ?? inputs.toMin);
	const toMaximum = number(inputs["to-max"] ?? inputs.toMax, 1);
	const denominator = fromMaximum - fromMinimum;
	let factor = denominator === 0 ? 0 : (value - fromMinimum) / denominator;
	if (config.clamp !== false) {
		factor = Math.max(0, Math.min(1, factor));
	}
	return Object.freeze({ value: toMinimum + factor * (toMaximum - toMinimum) });
}

export function executeClamp(inputs = {}) {
	const minimum = number(inputs.minimum);
	const maximum = number(inputs.maximum, 1);
	return Object.freeze({ value: Math.max(minimum, Math.min(maximum, number(inputs.value))) });
}

export function executeBooleanMath(inputs = {}, config = {}) {
	const a = Boolean(inputs.a);
	const b = Boolean(inputs.b);
	const operations = {
		and: a && b,
		or: a || b,
		not: !a,
		xor: a !== b,
		nand: !(a && b),
		nor: !(a || b),
		xnor: a === b,
		imply: !a || b
	};
	return Object.freeze({ boolean: operations[config.operation] ?? operations.and });
}
