//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module CivicPropFactory
 * @description
 * Lamps, benches, carts, crates, and fountains use timber, iron, stone, and water
 * from the real Awtsmoos material library. Awtsmoos.com composes advanced cached
 * core profiles so public space reads as working infrastructure, never decoration.
 */
export function createLamp(parts, options = {}) {
	const iron = { materialRole: 'metal', tint: 0xffffff };
	return place(parts.group(options.name || 'street-lamp', [
		parts.part({ ...iron, primitive: 'cylinder', name: 'lamp-base', position: [0, 0.18, 0], scale: [0.26, 0.36, 0.26] }),
		parts.part({ ...iron, primitive: 'cylinder', name: 'lamp-post', position: [0, 1.08, 0], scale: [0.11, 1.72, 0.11] }),
		parts.part({ ...iron, primitive: 'torus', name: 'lamp-bracket', position: [0, 1.88, 0], rotation: [Math.PI / 2, 0, 0], scale: [0.32, 0.32, 0.32] }),
		parts.part({ primitive: 'icosphere', name: 'lamp-light', hue: 48, lightness: 0.82, position: [0, 2.08, 0], scale: [0.28, 0.34, 0.28] }),
		parts.part({ ...iron, name: 'lamp-cap', position: [0, 2.38, 0], scale: [0.42, 0.12, 0.42] })
	], metadata('lamp', options, 'lights a walking route after dark')), options);
}

export function createBench(parts, options = {}) {
	const wood = { materialRole: 'timber', tint: 0xffffff };
	const iron = { materialRole: 'metal', tint: 0xffffff };
	return place(parts.group(options.name || 'public-bench', [
		...[-0.42, 0, 0.42].map((z, index) => parts.part({ ...wood, name: `bench-slat-${index}`, position: [0, 0.52, z * 0.42], scale: [1.42, 0.12, 0.18] })),
		...[-0.38, 0, 0.38].map((y, index) => parts.part({ ...wood, name: `back-slat-${index}`, position: [0, 0.92 + y * 0.7, -0.24], scale: [1.42, 0.13, 0.12] })),
		...[-0.52, 0.52].map((x, index) => parts.part({ ...iron, name: `bench-leg-${index}`, position: [x, 0.25, 0], scale: [0.12, 0.5, 0.34] })),
		...[-0.72, 0.72].map((x, index) => parts.part({ ...iron, primitive: 'torus', name: `arm-rest-${index}`, position: [x, 0.72, 0], rotation: [Math.PI / 2, 0, 0], scale: [0.28, 0.28, 0.28] }))
	], metadata('bench', options, 'gives residents a place to rest and speak')), options);
}

export function createCart(parts, options = {}) {
	const wood = { materialRole: 'timber', tint: 0xffffff };
	const iron = { materialRole: 'metal', tint: 0xffffff };
	return place(parts.group(options.name || 'market-cart', [
		parts.part({ ...wood, name: 'cart-bed', position: [0, 0.68, 0], scale: [1.46, 0.44, 0.84] }),
		...[-0.72, 0.72].map((x, index) => parts.part({ ...iron, primitive: 'torus', name: `cart-wheel-${index}`, position: [x, 0.36, 0], rotation: [0, Math.PI / 2, 0], scale: [0.46, 0.46, 0.46] })),
		...[-0.64, 0.64].map((x, index) => parts.part({ ...wood, name: `cart-rail-${index}`, position: [x, 0.98, 0], scale: [0.1, 0.48, 0.88] })),
		parts.part({ ...wood, primitive: 'cylinder', name: 'cart-handle', position: [0, 0.76, -1.02], rotation: [Math.PI / 2, 0, 0], scale: [0.11, 1.38, 0.11] })
	], metadata('cart', options, 'moves supplies between homes and markets')), options);
}

export function createCrate(parts, options = {}) {
	const wood = { materialRole: 'timber', tint: 0xffffff };
	const iron = { materialRole: 'metal', tint: 0xffffff };
	return place(parts.group(options.name || 'supply-crate', [
		parts.part({ ...wood, name: 'crate-body', position: [0, 0.5, 0], scale: [0.92, 0.88, 0.92] }),
		...[-0.43, 0.43].flatMap((x, side) => [-0.43, 0.43].map((z, index) => parts.part({ ...iron, name: `crate-corner-${side}-${index}`, position: [x, 0.5, z], scale: [0.09, 0.92, 0.09] }))),
		parts.part({ ...iron, name: 'crate-band-h', position: [0, 0.5, 0.47], scale: [0.94, 0.12, 0.05] }),
		parts.part({ ...iron, name: 'crate-band-v', position: [0, 0.5, 0.47], scale: [0.12, 0.94, 0.05] })
	], metadata('crate', options, 'stores food, medicine, or building supplies')), options);
}

export function createFountain(parts, options = {}) {
	const stone = { materialRole: 'masonry', tint: 0xffffff };
	const water = { materialRole: 'water', tint: 0xffffff };
	return place(parts.group(options.name || 'city-fountain', [
		parts.part({ ...stone, primitive: 'cylinder', name: 'fountain-base', position: [0, 0.16, 0], scale: [1.62, 0.28, 1.62] }),
		parts.part({ ...stone, primitive: 'torus', name: 'fountain-rim', position: [0, 0.44, 0], rotation: [Math.PI / 2, 0, 0], scale: [1.25, 1.25, 1.25] }),
		parts.part({ ...water, primitive: 'cylinder', name: 'fountain-water', position: [0, 0.48, 0], scale: [1.08, 0.06, 1.08] }),
		parts.part({ ...stone, primitive: 'cylinder', name: 'fountain-column', position: [0, 1.04, 0], scale: [0.24, 1.12, 0.24] }),
		parts.part({ ...water, primitive: 'icosphere', name: 'fountain-spray', position: [0, 1.72, 0], scale: [0.34, 0.42, 0.34] })
	], metadata('fountain', options, 'marks a shared gathering place for the city')), options);
}

function metadata(type, options, fallbackReason) {
	return { reason: options.reason || fallbackReason, role: options.role || type, semanticType: type };
}

function place(group, options) {
	group.position.set(...(options.position || [0, 0, 0]));
	group.rotation.y = options.rotationY || 0;
	group.scale.setScalar(options.scale ?? 0.55);
	group.userData.detailLayers = group.children.length;
	return group;
}
