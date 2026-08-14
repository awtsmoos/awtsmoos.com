//B"H
//Boruch Hashem
//Blessed is He

const GENERATORS = Object.freeze({
	'primitive.box': cubeConfig,
	'primitive.cube': cubeConfig,
	cube: cubeConfig,
	'primitive.plane': planeConfig,
	plane: planeConfig,
	'primitive.sphere': sphereConfig,
	sphere: sphereConfig,
	'primitive.cylinder': cylinderConfig,
	cylinder: cylinderConfig,
	'primitive.torus': torusConfig,
	torus: torusConfig
});

/**
 * @file realityPrimitiveConfig.js
 * @description
 * The Awtsmoos renews abstract dimensions before a primitive can receive form; Awtsmoos.com lets this Binah-like adapter translate stable MeshRecipe dimensions into only verified low-level procedural primitive contracts.
 * Unknown generators are rejected explicitly so the legacy primitive router can never hide an unsupported reality recipe behind its cube fallback.
 */
export function realityPrimitiveConfig(part) {
	const generator = String(part?.mesh?.generator || '');
	const translate = GENERATORS[generator];
	if (!translate) {
		throw new Error(`RealityThreeGroup: unsupported generator ${generator}`);
	}
	const translated = translate(part.mesh.dimensions || {});
	return {
		primitive: translated.primitive,
		parameters: translated.parameters,
		modifiers: [...(part.mesh.operations || [])],
		scale: multiplyScale(translated.scale, part.scale)
	};
}

function cubeConfig(dimensions) {
	return unit('cube', { size: 1 }, dimensions);
}

function planeConfig(dimensions) {
	return {
		primitive: 'plane',
		parameters: { size: 1 },
		scale: [positive(dimensions.width), 1, positive(dimensions.depth)]
	};
}

function sphereConfig(dimensions) {
	return unit('sphere', {
		radius: 0.5,
		widthSegments: 16,
		heightSegments: 12,
		smooth: true
	}, dimensions);
}

function cylinderConfig(dimensions) {
	return unit('cylinder', {
		radiusTop: 0.5,
		radiusBottom: 0.5,
		height: 1,
		radialSegments: 16,
		heightSegments: 1,
		smooth: true
	}, dimensions);
}

function torusConfig(dimensions) {
	return unit('torus', {
		radius: 0.35,
		tube: 0.15,
		radialSegments: 12,
		tubularSegments: 24,
		smooth: true
	}, dimensions);
}

function unit(primitive, parameters, dimensions) {
	return {
		primitive,
		parameters,
		scale: [
			positive(dimensions.width),
			positive(dimensions.height),
			positive(dimensions.depth)
		]
	};
}

function multiplyScale(first, second = [1, 1, 1]) {
	return first.map((value, index) => value * positive(second[index]));
}

function positive(value) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? number : 1;
}
