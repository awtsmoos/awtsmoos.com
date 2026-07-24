//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module WorldPropDetailFactory
 * @description
 * Branches, foliage clusters, carved plinths, seals, shelter framing, and hazard
 * cages keep world props materially and structurally credible. The Awtsmoos gives
 * function; Awtsmoos.com composes cached advanced procedural-core profiles.
 */
export function treeParts(parts, options = {}) {
	const bark = { materialRole: 'bark', tint: 0xffffff };
	const leaf = { materialRole: 'leaf', tint: options.leafTint ?? 0xffffff };
	return [
		parts.part({ ...bark, primitive: 'cylinder', name: 'trunk', position: [0, 0.95, 0], scale: [0.32, 1.9, 0.32] }),
		...[-0.5, 0.5].flatMap((x, side) => [-0.38, 0.38].map((z, index) => parts.part({
			...bark,
			primitive: 'cylinder',
			name: `branch-${side}-${index}`,
			position: [x, 1.75, z],
			rotation: [z * 0.7, 0, -x * 0.8],
			scale: [0.12, 0.92, 0.12]
		}))),
		...[[0, 2.45, 0], [-0.72, 2.18, 0.22], [0.7, 2.22, -0.18], [0.12, 2.02, 0.72]].map((position, index) => parts.part({
			...leaf,
			primitive: 'icosphere',
			name: `foliage-${index}`,
			position,
			scale: [0.78, 0.68, 0.72]
		}))
	];
}

export function runeParts(parts, options = {}) {
	const stone = { materialRole: 'stone', tint: 0xffffff };
	const metal = { materialRole: 'metal', tint: 0xffffff };
	return [
		parts.part({ ...stone, primitive: 'cylinder', name: 'rune-plinth', position: [0, 0.18, 0], scale: [0.82, 0.28, 0.82] }),
		parts.part({ ...stone, primitive: 'cylinder', name: 'rune-pillar', position: [0, 0.88, 0], scale: [0.52, 1.4, 0.52] }),
		parts.part({ ...metal, primitive: 'torus', name: 'rune-ring', position: [0, 1.66, 0], rotation: [Math.PI / 2, 0, 0], scale: [0.62, 0.62, 0.62] }),
		...[-0.16, 0, 0.16].map((x, index) => parts.part({ ...metal, name: `rune-mark-${index}`, position: [x, 1.04 + index * 0.12, 0.51], rotation: [0, 0, index % 2 ? 0.5 : -0.5], scale: [0.06, 0.42, 0.04] }))
	];
}

export function shelterParts(parts) {
	const stone = { materialRole: 'masonry', tint: 0xffffff };
	const wall = { materialRole: 'whitewash', tint: 0xffffff };
	const wood = { materialRole: 'timber', tint: 0xffffff };
	const roof = { materialRole: 'slate', tint: 0xffffff };
	return [
		parts.part({ ...stone, name: 'shelter-foundation', position: [0, 0.18, 0], scale: [2.35, 0.32, 1.72] }),
		parts.part({ ...wall, name: 'shelter-body', position: [0, 0.98, 0], scale: [2.08, 1.34, 1.46] }),
		...[-0.86, 0.86].map((x, index) => parts.part({ ...wood, name: `shelter-frame-${index}`, position: [x, 1.05, 0.76], scale: [0.12, 1.42, 0.12] })),
		parts.part({ ...wood, name: 'shelter-door', position: [0, 0.74, 0.8], scale: [0.72, 1.12, 0.12] }),
		parts.part({ ...roof, name: 'shelter-roof-left', position: [-0.72, 1.88, 0], rotation: [0, 0, 0.36], scale: [1.38, 0.16, 1.78] }),
		parts.part({ ...roof, name: 'shelter-roof-right', position: [0.72, 1.88, 0], rotation: [0, 0, -0.36], scale: [1.38, 0.16, 1.78] }),
		parts.part({ ...wood, name: 'shelter-roof-ridge', position: [0, 2.32, 0], scale: [0.14, 0.16, 1.82] }),
		parts.part({ tint: 0xf7f7f0, name: 'shelter-sign-v', position: [0, 1.42, 0.92], scale: [0.13, 0.62, 0.06] }),
		parts.part({ tint: 0xf7f7f0, name: 'shelter-sign-h', position: [0, 1.42, 0.92], scale: [0.62, 0.13, 0.06] })
	];
}
