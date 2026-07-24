//B"H
//Boruch Hashem
//Blessed is He

import { CorePartFactory } from '../procedural/core-part-factory.js';

/**
 * @module RealmEquipmentVisualizer
 * @description
 * Equipped custody becomes visible cloth, iron, timber, leather, rope, and brass on
 * the moving traveler. The Awtsmoos gives every material reality; Awtsmoos.com uses
 * layered procedural-core assemblies and reports only their bounded visible count.
 */
export class RealmEquipmentVisualizer {
	constructor(player) {
		this.player = player;
		this.parts = new CorePartFactory();
		this.visuals = createVisuals(this.parts);
		this.player.add(...Object.values(this.visuals));
	}

	refresh(state) {
		const equippedDefinitions = new Set(Object.values(state.equipment)
			.map(itemId => state.items[itemId]?.definitionId)
			.filter(Boolean));
		let visibleCount = 0;
		for (const [definitionId, visual] of Object.entries(this.visuals)) {
			visual.visible = equippedDefinitions.has(definitionId);
			if (visual.visible) visibleCount += 1;
		}
		return visibleCount;
	}
}

function createVisuals(parts) {
	return {
		'traveler-coat': group(parts, 'visible-traveler-coat', [
			piece(parts, 'cloth', 'coat-back', [0, 1.45, -0.38], [0.72, 1.35, 0.12]),
			piece(parts, 'leather', 'coat-belt', [0, 1.32, 0], [0.82, 0.12, 0.48])
		]),
		'timber-hammer': group(parts, 'visible-timber-hammer', [
			piece(parts, 'timber', 'hammer-handle', [0.72, 1.08, 0], [0.12, 0.9, 0.12], [0, 0, -0.24]),
			piece(parts, 'iron', 'hammer-head', [0.92, 1.43, 0], [0.52, 0.22, 0.24])
		]),
		'rescue-rope': group(parts, 'visible-rescue-rope', [
			piece(parts, 'cloth', 'rope-coil-outer', [-0.58, 1.35, -0.34], [0.42, 0.62, 0.14]),
			piece(parts, 'leather', 'rope-strap', [-0.58, 1.35, -0.48], [0.12, 0.78, 0.08])
		]),
		'merchant-scale': group(parts, 'visible-merchant-scale', [
			piece(parts, 'iron', 'scale-beam', [0.7, 1.2, 0.22], [0.6, 0.08, 0.08]),
			piece(parts, 'iron', 'scale-pan-left', [0.48, 1.04, 0.22], [0.18, 0.08, 0.18]),
			piece(parts, 'iron', 'scale-pan-right', [0.92, 1.04, 0.22], [0.18, 0.08, 0.18])
		]),
		'medicine-satchel': group(parts, 'visible-medicine-satchel', [
			piece(parts, 'leather', 'satchel-body', [-0.65, 1.05, 0.15], [0.46, 0.58, 0.22]),
			piece(parts, 'cloth', 'satchel-flap', [-0.65, 1.28, 0.27], [0.42, 0.18, 0.08])
		]),
		'bridgewright-gloves': group(parts, 'visible-gloves', [
			piece(parts, 'leather', 'glove-left', [-0.72, 0.82, 0], [0.2, 0.3, 0.2]),
			piece(parts, 'leather', 'glove-right', [0.72, 0.82, 0], [0.2, 0.3, 0.2])
		]),
		'sanctuary-cloak': group(parts, 'visible-sanctuary-cloak', [
			piece(parts, 'cloth', 'cloak-main', [0, 1.42, -0.46], [0.9, 1.55, 0.12]),
			piece(parts, 'leather', 'cloak-clasp', [0, 2.03, 0.28], [0.2, 0.15, 0.12])
		]),
		'road-warden-staff': group(parts, 'visible-road-staff', [
			piece(parts, 'timber', 'staff-shaft', [0.82, 1.15, -0.18], [0.1, 1.8, 0.1], [0, 0, -0.12]),
			piece(parts, 'iron', 'staff-cap', [0.98, 1.98, -0.18], [0.22, 0.28, 0.22])
		])
	};
}

function piece(parts, materialRole, name, position, scale, rotation = [0, 0, 0]) {
	return parts.part({ materialRole, tint: 0xffffff, name, position, scale, rotation, profile: 'equipment-detail' });
}

function group(parts, name, children) {
	const root = parts.group(name, children, {
		semanticType: 'visible-equipment',
		role: 'equipped-item',
		reason: 'material equipment carried by the traveler'
	});
	root.visible = false;
	return root;
}
