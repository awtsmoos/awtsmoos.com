//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module BuildingDetailFactory
 * @description
 * A building is foundation, load, frame, opening, drainage, threshold, and roof.
 * The Awtsmoos grants architecture its possibility; Awtsmoos.com assembles real
 * photographed materials upon cached procedural-core profiles instead of boxes.
 */
export function houseParts(parts, options = {}) {
	const wall = { materialRole: 'whitewash', tint: 0xffffff };
	const wood = { materialRole: 'timber', tint: 0xffffff };
	const stone = { materialRole: 'masonry', tint: 0xffffff };
	const roof = { materialRole: 'slate', tint: 0xffffff };
	return [
		part(parts, 'foundation', stone, [0, 0.18, 0], [1.72, 0.32, 1.45]),
		part(parts, 'walls', wall, [0, 0.92, 0], [1.52, 1.2, 1.25]),
		...timberFrame(parts, wood),
		part(parts, 'door-frame', wood, [0, 0.61, 0.68], [0.5, 0.92, 0.13]),
		part(parts, 'door', wood, [0, 0.58, 0.76], [0.34, 0.76, 0.08]),
		...windowAssembly(parts, -0.52, wood),
		...windowAssembly(parts, 0.52, wood),
		part(parts, 'roof-left', roof, [-0.52, 1.68, 0], [1.08, 0.14, 1.5], [0, 0, 0.43]),
		part(parts, 'roof-right', roof, [0.52, 1.68, 0], [1.08, 0.14, 1.5], [0, 0, -0.43]),
		part(parts, 'roof-ridge', wood, [0, 2.08, 0], [0.14, 0.16, 1.55]),
		part(parts, 'chimney', stone, [0.62, 2.05, -0.38], [0.3, 0.72, 0.34]),
		part(parts, 'front-step', stone, [0, 0.16, 0.98], [0.74, 0.18, 0.46])
	];
}

export function towerParts(parts, options = {}) {
	const stone = { materialRole: 'masonry', tint: 0xffffff };
	const metal = { materialRole: 'metal', tint: 0xffffff };
	return [
		parts.part({ ...stone, primitive: 'cylinder', name: 'tower-foundation', position: [0, 0.18, 0], scale: [1.22, 0.36, 1.22] }),
		parts.part({ ...stone, primitive: 'cylinder', name: 'tower-shaft', position: [0, 1.18, 0], scale: [0.92, 1.85, 0.92] }),
		...[-1, 1].flatMap(x => [-1, 1].map(z => part(parts, `buttress-${x}-${z}`, stone, [x * 0.68, 0.75, z * 0.68], [0.25, 1.18, 0.25]))),
		parts.part({ ...stone, primitive: 'cylinder', name: 'tower-balcony', position: [0, 2.15, 0], scale: [1.18, 0.22, 1.18] }),
		parts.part({ ...metal, primitive: 'torus', name: 'broadcast-ring', position: [0, 2.48, 0], rotation: [Math.PI / 2, 0, 0], scale: [0.86, 0.86, 0.86] }),
		parts.part({ ...metal, primitive: 'cylinder', name: 'antenna', position: [0, 2.9, 0], scale: [0.1, 0.9, 0.1] }),
		parts.part({ primitive: 'icosphere', name: 'beacon', hue: options.hue ?? 350, lightness: 0.72, position: [0, 3.44, 0], scale: [0.3, 0.3, 0.3] })
	];
}

export function stallParts(parts, options = {}) {
	const wood = { materialRole: 'timber', tint: 0xffffff };
	const cloth = { materialRole: 'cloth', tint: options.tint ?? 0xffffff };
	return [
		part(parts, 'stall-foundation', wood, [0, 0.16, 0], [1.8, 0.22, 1.12]),
		part(parts, 'counter', wood, [0, 0.72, 0.22], [1.62, 0.48, 0.72]),
		...[-1.14, 1.14].map((x, index) => part(parts, `post-${index}`, wood, [x, 1.22, 0], [0.14, 2.1, 0.14])),
		part(parts, 'canopy-main', cloth, [0, 2.18, 0], [1.55, 0.12, 1.18]),
		part(parts, 'canopy-valance', cloth, [0, 1.98, 0.92], [1.55, 0.28, 0.12]),
		...[-0.58, 0, 0.58].map((x, index) => parts.part({ primitive: 'icosphere', name: `goods-${index}`, hue: 18 + index * 52, position: [x, 1.08, 0.58], scale: [0.24, 0.2, 0.24] })),
		part(parts, 'price-board', wood, [0, 1.48, -0.48], [0.72, 0.42, 0.08])
	];
}

export function courtParts(parts) {
	const stone = { materialRole: 'masonry', tint: 0xffffff };
	const plaster = { materialRole: 'whitewash', tint: 0xffffff };
	const roof = { materialRole: 'slate', tint: 0xffffff };
	const wood = { materialRole: 'timber', tint: 0xffffff };
	return [
		part(parts, 'court-foundation', stone, [0, 0.2, 0], [2.9, 0.38, 2.05]),
		part(parts, 'court-body', plaster, [0, 1.02, -0.18], [2.58, 1.35, 1.62]),
		...[-1.08, -0.36, 0.36, 1.08].map((x, index) => parts.part({ ...stone, primitive: 'cylinder', name: `column-${index}`, position: [x, 1.18, 0.92], scale: [0.18, 1.82, 0.18] })),
		part(parts, 'court-lintel', stone, [0, 2.12, 0.92], [2.66, 0.24, 0.36]),
		part(parts, 'court-roof', roof, [0, 2.42, -0.05], [2.95, 0.24, 1.96]),
		part(parts, 'court-door', wood, [0, 0.82, 0.88], [0.72, 1.22, 0.12]),
		...[-0.35, 0, 0.35].map((z, index) => part(parts, `court-step-${index}`, stone, [0, 0.12 + index * 0.1, 1.62 - z], [2.2 - index * 0.22, 0.16, 0.45])),
		part(parts, 'pediment', stone, [0, 2.34, 0.88], [1.72, 0.32, 0.38], [0, 0, Math.PI / 4])
	];
}

function timberFrame(parts, wood) {
	return [
		...[-0.7, 0, 0.7].map((x, index) => part(parts, `frame-v-${index}`, wood, [x, 1.05, 0.66], [0.1, 1.36, 0.1])),
		...[-0.15, 0.62, 1.38].map((y, index) => part(parts, `frame-h-${index}`, wood, [0, y, 0.66], [1.48, 0.1, 0.1]))
	];
}

function windowAssembly(parts, x, wood) {
	return [
		part(parts, `window-recess-${x}`, { tint: 0x8ccfff, clearcoat: 0.5 }, [x, 1.04, 0.7], [0.36, 0.42, 0.06]),
		part(parts, `window-sill-${x}`, wood, [x, 0.78, 0.73], [0.48, 0.1, 0.12]),
		part(parts, `shutter-left-${x}`, wood, [x - 0.28, 1.04, 0.75], [0.12, 0.48, 0.08]),
		part(parts, `shutter-right-${x}`, wood, [x + 0.28, 1.04, 0.75], [0.12, 0.48, 0.08])
	];
}

function part(parts, name, material, position, scale, rotation = [0, 0, 0]) {
	return parts.part({ ...material, name, position, rotation, scale });
}
