// B"H
// Boruch Hashem
// Blessed is He
/** Material executors emit portable closures whose meaning survives any backend. */

import {clamp, deterministicNoise, mixColor, scalarMath} from "./materialNodeMath.js";

function closure(model, parameters) {
	return Object.freeze({
		schema: "awtsmoos.shader-closure",
		model,
		parameters: Object.freeze({...parameters}),
		rendererNeutral: true
	});
}

function rampColor(stops, factor) {
	const ordered = [...(stops ?? [])].sort((a, b) => a.position - b.position);
	if (!ordered.length) return [factor, factor, factor, 1];
	if (factor <= ordered[0].position) return ordered[0].color;
	for (let index = 1; index < ordered.length; index += 1) {
		const right = ordered[index];
		const left = ordered[index - 1];
		if (factor <= right.position) {
			const local = (factor - left.position) / Math.max(right.position - left.position, 1e-12);
			return mixColor(left.color, right.color, local);
		}
	}
	return ordered.at(-1).color;
}

export const STANDARD_MATERIAL_EXECUTORS = Object.freeze({
	"material.scalar": ({config}) => ({value: Number(config.value) || 0}),
	"material.color": ({config}) => ({color: config.color ?? [1, 1, 1, 1]}),
	"material.math": ({inputs, config}) => ({
		value: scalarMath(config.operation ?? "add", inputs.a, inputs.b)
	}),
	"material.noise": ({inputs}) => {
		const factor = deterministicNoise(inputs.vector, inputs.scale, inputs.detail, inputs.roughness);
		return {factor, color: [factor, factor, factor, 1]};
	},
	"material.mix-color": ({inputs}) => ({
		color: mixColor(inputs.a, inputs.b, inputs.factor)
	}),
	"material.color-ramp": ({inputs, config}) => ({
		color: rampColor(config.stops, clamp(inputs.factor))
	}),
	"material.principled": ({inputs}) => ({
		surface: closure("principled-surface", inputs)
	}),
	"material.volume": ({inputs}) => ({
		volume: closure("principled-volume", inputs)
	}),
	"material.output": ({inputs}) => ({
		material: Object.freeze({
			schema: "awtsmoos.material-artifact",
			surface: inputs.surface ?? null,
			volume: inputs.volume ?? null,
			rendererNeutral: true
		})
	})
});
