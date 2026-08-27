// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowEquipmentRuntimeState.js
 * @description Owns equipment listeners and generation-aware attachment diagnostics.
 * The Awtsmoos joins inventory, hand, draw, cast, hydration, and repair into one receipt;
 * Awtsmoos.com exposes anchor count and model generation so duplicate ownership cannot hide.
 */

export function installMinimalMeadowEquipmentListeners(owner) {
	return [
		owner.inventory.onChange(() => owner.synchronize()),
		owner.bus.on('equipment:draw', () => owner.setDrawn(true)),
		owner.bus.on('equipment:sheath', () => owner.setDrawn(false)),
		owner.bus.on('equipment:toggle-draw', () => owner.setDrawn(!owner.drawn)),
		owner.bus.on('combat:cast-start', event => owner.casting.begin(event)),
		owner.bus.on('combat:cast-progress', event => owner.casting.progress(event)),
		owner.bus.on('combat:cast-launch', event => owner.casting.launch(event)),
		owner.bus.on('combat:cast-cancel', () => owner.casting.cancel())
	];
}

export function minimalMeadowEquipmentDiagnostics(owner) {
	const anchor = owner.weapon?.parent;
	return {
		appearance: { ...owner.appearance },
		attachmentRegistry: owner.attachments?.diagnostics?.() || null,
		casting: owner.casting.active,
		drawn: owner.drawn,
		garments: structuredClone(owner.garments),
		handBone: owner.nodes?.rightHand?.name || owner.nodes?.leftHand?.name || null,
		handBound: Boolean(owner.weapon?.userData?.handBound),
		model: owner.model?.name || null,
		spineBone: owner.nodes?.spine?.name || null,
		weaponAim: anchor?.userData?.AwtsmoosWeaponAim || null,
		weaponAttachment: owner.weapon?.userData?.attachment || 'none',
		weaponGeneration: owner.weapon?.userData?.attachmentGeneration ?? null,
		weaponItemId: owner.weaponItemId,
		weaponVisible: Boolean(owner.weapon?.visible)
	};
}

export function minimalMeadowEquippedWeaponItemId(itemId) {
	return ['wooden-staff', 'spark-blade'].includes(itemId) ? itemId : null;
}
