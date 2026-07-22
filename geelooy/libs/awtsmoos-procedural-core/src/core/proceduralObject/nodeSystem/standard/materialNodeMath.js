// B"H
// Boruch Hashem
// Blessed is He
/** Deterministic scalar and color math gives procedural materials a CPU reference. */

export function clamp(value, minimum = 0, maximum = 1) {
	return Math.min(maximum, Math.max(minimum, Number(value) || 0));
}

export function mixColor(a, b, factor) {
	const amount = clamp(factor);
	return Object.freeze(Array.from({length: 4}, (_, index) =>
		(a?.[index] ?? (index === 3 ? 1 : 0)) * (1 - amount)
		+ (b?.[index] ?? (index === 3 ? 1 : 0)) * amount
	));
}

export function scalarMath(operation, a, b) {
	const left = Number(a) || 0;
	const right = Number(b) || 0;
	const operations = {
		add: () => left + right,
		subtract: () => left - right,
		multiply: () => left * right,
		divide: () => right === 0 ? 0 : left / right,
		minimum: () => Math.min(left, right),
		maximum: () => Math.max(left, right),
		power: () => Math.pow(left, right)
	};
	return (operations[operation] ?? operations.add)();
}

export function deterministicNoise(vector, scale = 5, detail = 2, roughness = 0.5) {
	let amplitude = 1;
	let frequency = Math.max(0.0001, Number(scale) || 5);
	let value = 0;
	let weight = 0;
	for (let octave = 0; octave < Math.max(1, Math.floor(detail)); octave += 1) {
		const phase = (vector ?? [0, 0, 0]).reduce((sum, component, index) =>
			sum + Number(component || 0) * frequency * [12.9898, 78.233, 37.719][index], 0);
		value += (Math.sin(phase) * 43758.5453 % 1 + 1) % 1 * amplitude;
		weight += amplitude;
		amplitude *= clamp(roughness);
		frequency *= 2;
	}
	return weight ? value / weight : 0;
}
