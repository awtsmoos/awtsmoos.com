//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module AdvancedProfileFactory
 * @description
 * Profiles keep the Awtsmoos procedural core at the birth of every fallback mesh.
 * Awtsmoos.com chooses bounded subdivision and denser radial forms once per cached
 * template, including small worn equipment details, never per animation frame.
 */
export function advancedProfile(options = {}) {
	const profile = options.profile || profileForPrimitive(options.primitive);
	if (profile === 'architectural') {
		return cubeProfile(1);
	}
	if (profile === 'equipment-detail') {
		return cubeProfile(1);
	}
	if (profile === 'organic') {
		return { modifiers: [], primitive: 'icosphere', parameters: { radius: 0.5, subdivisions: 2 } };
	}
	if (profile === 'column') {
		return { modifiers: [], primitive: 'cylinder', parameters: { radius: 0.5, height: 1, radialSegments: 16 } };
	}
	if (profile === 'ring') {
		return { modifiers: [], primitive: 'torus', parameters: { majorRadius: 0.5, minorRadius: 0.13, majorSegments: 20, minorSegments: 8 } };
	}
	return { modifiers: [], primitive: options.primitive || 'cube', parameters: primitiveParameters(options.primitive) };
}

function cubeProfile(levels) {
	return {
		modifiers: [{ type: 'subdivide', levels }],
		primitive: 'cube',
		parameters: { size: 1 }
	};
}

function profileForPrimitive(primitive = 'cube') {
	if (primitive === 'sphere' || primitive === 'icosphere') return 'organic';
	if (primitive === 'cylinder') return 'column';
	if (primitive === 'torus') return 'ring';
	return 'architectural';
}

function primitiveParameters(primitive) {
	if (primitive === 'sphere' || primitive === 'icosphere') return { radius: 0.5, subdivisions: 2 };
	if (primitive === 'cylinder') return { radius: 0.5, height: 1, radialSegments: 16 };
	if (primitive === 'torus') return { majorRadius: 0.5, minorRadius: 0.13, majorSegments: 20, minorSegments: 8 };
	return { size: 1 };
}
