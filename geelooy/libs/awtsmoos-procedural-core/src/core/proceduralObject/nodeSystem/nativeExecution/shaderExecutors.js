// B"H
// Boruch Hashem
// Blessed is He
/** Shader reference execution builds closure IR rather than pretending to render. */

function closure(type, parameters) {
	return Object.freeze({
		schema: "awtsmoos.shader-closure",
		type,
		parameters: Object.freeze({ ...parameters })
	});
}

export function executePrincipledSurface(inputs = {}) {
	return Object.freeze({
		surface: closure("principled", {
			baseColor: inputs["base-color"] ?? [0.8, 0.8, 0.8, 1],
			metallic: Number(inputs.metallic ?? 0),
			roughness: Number(inputs.roughness ?? 0.5),
			ior: Number(inputs.ior ?? 1.45),
			alpha: Number(inputs.alpha ?? 1),
			subsurfaceWeight: Number(inputs["subsurface-weight"] ?? 0),
			coatWeight: Number(inputs["coat-weight"] ?? 0),
			emissionColor: inputs["emission-color"] ?? [0, 0, 0, 1],
			emissionStrength: Number(inputs["emission-strength"] ?? 0)
		})
	});
}

export function executeEmission(inputs = {}) {
	return Object.freeze({
		surface: closure("emission", {
			color: inputs.color ?? [1, 1, 1, 1],
			strength: Number(inputs.strength ?? 1)
		})
	});
}

export function executeMixSurface(inputs = {}) {
	return Object.freeze({
		surface: closure("mix", {
			factor: Number(inputs.factor ?? 0.5),
			a: inputs.a ?? null,
			b: inputs.b ?? null
		})
	});
}

export function executeMaterialOutput(inputs = {}) {
	return Object.freeze({
		material: Object.freeze({
			schema: "awtsmoos.material-artifact",
			surface: inputs.surface ?? null,
			volume: inputs.volume ?? null,
			displacement: inputs.displacement ?? null,
			thickness: Number(inputs.thickness ?? 0)
		})
	});
}
