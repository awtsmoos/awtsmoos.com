// B"H
// Boruch Hashem
// Blessed is He
/** Vector and color executors preserve dimensions and typed output meaning. */

function vector(value, length = 3) {
	const source = Array.isArray(value) || ArrayBuffer.isView(value)
		? Array.from(value)
		: [];
	return Array.from({ length }, (_, index) => Number(source[index] ?? 0));
}

export function executeVectorMath(inputs = {}, config = {}) {
	const a = vector(inputs.a);
	const b = vector(inputs.b);
	const operation = String(config.operation ?? "add").toLowerCase();
	const component = (index) => ({
		add: a[index] + b[index],
		subtract: a[index] - b[index],
		multiply: a[index] * b[index],
		divide: b[index] === 0 ? 0 : a[index] / b[index]
	})[operation] ?? a[index] + b[index];
	if (operation === "dot") {
		return Object.freeze({ vector: [0, 0, 0], value: a.reduce((sum, value, index) => sum + value * b[index], 0) });
	}
	if (operation === "cross") {
		return Object.freeze({ vector: [
			a[1] * b[2] - a[2] * b[1],
			a[2] * b[0] - a[0] * b[2],
			a[0] * b[1] - a[1] * b[0]
		], value: 0 });
	}
	const result = a.map((_, index) => component(index));
	const length = Math.hypot(...result);
	if (operation === "normalize") {
		return Object.freeze({ vector: length ? result.map((value) => value / length) : result, value: length });
	}
	return Object.freeze({ vector: result, value: length });
}

export function executeMix(inputs = {}) {
	const factor = Math.max(0, Math.min(1, Number(inputs.factor ?? 0.5)));
	const a = inputs.a ?? inputs["color-one"] ?? 0;
	const b = inputs.b ?? inputs["color-two"] ?? 1;
	if (Array.isArray(a) || ArrayBuffer.isView(a)) {
		const left = vector(a, Math.max(4, a.length));
		const right = vector(b, left.length);
		return Object.freeze({ result: left.map((value, index) => value + (right[index] - value) * factor) });
	}
	return Object.freeze({ result: Number(a) + (Number(b) - Number(a)) * factor });
}

export function executeSeparateColor(inputs = {}) {
	const color = vector(inputs.color, 4);
	return Object.freeze({ red: color[0], green: color[1], blue: color[2], alpha: color[3] });
}

export function executeCombineColor(inputs = {}) {
	return Object.freeze({ color: [
		Number(inputs.red ?? 0),
		Number(inputs.green ?? 0),
		Number(inputs.blue ?? 0),
		Number(inputs.alpha ?? 1)
	] });
}
