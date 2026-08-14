//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module PersonDetailFactory
 * @description
 * Shoulders, layered garment, biological skin, patterned eyes, fibrous hair, articulated limbs, shoes, and head covering make a citizen readable from motion and silhouette.
 * The Awtsmoos renews every person beyond material labels while Awtsmoos.com gives each visible surface a truthful photographic or procedural substance rather than a flat tint.
 */
export function personBody(parts, options = {}) {
	const skin = skinOptions(options);
	const cloth = {
		materialRole: 'cloth',
		tint: options.clothTint ?? parts.color(options.hue ?? 202, 0.62).getHex()
	};
	const leather = { materialRole: 'leather', tint: 0xffffff };
	const hair = {
		materialRole: 'hair',
		tint: parts.color(options.hairHue ?? 28, 0.18).getHex()
	};
	const covering = { ...cloth, tint: options.headTint ?? cloth.tint };
	const head = parts.group('head', [
		parts.part({ ...skin, primitive: 'icosphere', name: 'face', position: [0, 0, 0], scale: [0.48, 0.56, 0.46] }),
		parts.part({ ...hair, primitive: 'icosphere', name: 'hair', position: [0, 0.29, -0.03], scale: [0.49, 0.22, 0.45] }),
		parts.part({ ...covering, primitive: 'icosphere', name: 'head-covering', position: [0, 0.43, -0.02], scale: [0.3, 0.1, 0.3] }),
		parts.part({ ...skin, primitive: 'icosphere', name: 'ear-left', position: [-0.47, 0, 0], scale: [0.09, 0.15, 0.08] }),
		parts.part({ ...skin, primitive: 'icosphere', name: 'ear-right', position: [0.47, 0, 0], scale: [0.09, 0.15, 0.08] }),
		parts.part({ ...skin, primitive: 'icosphere', name: 'nose', position: [0, -0.02, 0.43], scale: [0.08, 0.13, 0.1] }),
		parts.part({ materialRole: 'eye', tint: 0x29384a, primitive: 'icosphere', name: 'eye-left', position: [-0.16, 0.1, 0.43], scale: [0.05, 0.07, 0.035] }),
		parts.part({ materialRole: 'eye', tint: 0x29384a, primitive: 'icosphere', name: 'eye-right', position: [0.16, 0.1, 0.43], scale: [0.05, 0.07, 0.035] }),
		parts.part({ materialRole: 'skin', tint: 0xb45f68, name: 'mouth', position: [0, -0.2, 0.44], scale: [0.18, 0.045, 0.03] })
	]);
	head.position.set(0, 2.08, 0);
	return [
		parts.part({ ...cloth, name: 'torso', position: [0, 1.17, 0], scale: [0.62, 0.78, 0.4] }),
		parts.part({ ...cloth, name: 'garment-layer', position: [0, 0.82, 0.01], scale: [0.7, 0.58, 0.44] }),
		parts.part({ ...skin, primitive: 'cylinder', name: 'neck', position: [0, 1.72, 0], scale: [0.16, 0.3, 0.16] }),
		parts.part({ ...cloth, name: 'shoulder-line', position: [0, 1.42, 0], scale: [0.96, 0.18, 0.42] }),
		head,
		limb(parts, 'left-arm', -0.5, cloth, skin),
		limb(parts, 'right-arm', 0.5, cloth, skin),
		leg(parts, 'left-leg', -0.22, cloth, leather),
		leg(parts, 'right-leg', 0.22, cloth, leather)
	];
}

function limb(parts, name, x, cloth, skin) {
	const side = Math.sign(x);
	const group = parts.group(name, [
		parts.part({ ...cloth, primitive: 'cylinder', name: `${name}-upper`, position: [0, -0.26, 0], scale: [0.16, 0.52, 0.16] }),
		parts.part({ ...cloth, primitive: 'cylinder', name: `${name}-lower`, position: [0, -0.72, 0.02], scale: [0.14, 0.46, 0.14] }),
		parts.part({ ...skin, primitive: 'icosphere', name: side < 0 ? 'left-hand' : 'right-hand', position: [0, -1.02, 0.04], scale: [0.16, 0.18, 0.14] })
	]);
	group.position.set(x, 1.48, 0);
	return group;
}

function leg(parts, name, x, cloth, leather) {
	const group = parts.group(name, [
		parts.part({ ...cloth, primitive: 'cylinder', name: `${name}-upper`, position: [0, -0.24, 0], scale: [0.2, 0.52, 0.22] }),
		parts.part({ ...cloth, primitive: 'cylinder', name: `${name}-lower`, position: [0, -0.7, 0], scale: [0.17, 0.46, 0.19] }),
		parts.part({ ...leather, name: name === 'left-leg' ? 'left-foot' : 'right-foot', position: [0, -1.0, 0.12], scale: [0.26, 0.16, 0.42] })
	]);
	group.position.set(x, 0.98, 0);
	return group;
}

function skinOptions(options) {
	return {
		materialRole: 'skin',
		tint: options.skinTint ?? 0xd7a578
	};
}
