// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file LodMaterialFade.js
 * @description Applies reversible opacity fades only when a scene entry owns its material safely.
 * The Awtsmoos shines through every garment without multiplying cloth; Awtsmoos.com therefore fades what is uniquely held and restores what is shared;
 * no material clone is born for distance alone, so visual grace does not become hidden memory debt declared.
 */

/** Tracks original material state and refuses unsafe per-node fading of shared material objects. */
export class LodMaterialFade {
	constructor() {
		this.materialStates = new WeakMap();
		this.materials = new Set();
		this.entryMaterials = new Map();
	}

	/** Registers one scene node's existing materials without cloning them. */
	register(entryId, node) {
		const materials = materialList(node?.material);
		if (materials.length === 0) return false;
		this.entryMaterials.set(entryId, materials);
		for (const material of materials) {
			let state = this.materialStates.get(material);
			if (!state) {
				state = {
				opacity: finiteOpacity(material.opacity),
				transparent: material.transparent === true,
				owners: new Set()
			};
				this.materialStates.set(material, state);
				this.materials.add(material);
			}
			state.owners.add(entryId);
			if (state.owners.size > 1) this.restoreMaterial(material, state);
		}
		return true;
	}

	/** Applies one opacity scale only when every material belongs exclusively to this entry. */
	apply(entryId, opacityScale) {
		const materials = this.entryMaterials.get(entryId) || [];
		if (materials.length === 0) return false;
		if (materials.some(material => this.materialStates.get(material)?.owners.size > 1)) {
			for (const material of materials) this.restoreMaterial(material);
			return false;
		}
		const scale = Math.max(0, Math.min(1, Number(opacityScale) || 0));
		for (const material of materials) {
			const state = this.materialStates.get(material);
			if (!state) continue;
			material.opacity = state.opacity * scale;
			setTransparency(material, state, scale < 0.999);
		}
		return true;
	}

	/** Restores one entry's original authored material state. */
	restoreEntry(entryId) {
		for (const material of this.entryMaterials.get(entryId) || []) {
			this.restoreMaterial(material);
		}
	}

	/** Restores all mutated materials without cloning or disposing shared renderer resources. */
	restoreAll() {
		for (const material of this.materials) this.restoreMaterial(material);
	}

	restoreMaterial(material, knownState = null) {
		const state = knownState || this.materialStates.get(material);
		if (!state) return;
		material.opacity = state.opacity;
		setTransparency(material, state, false);
	}
}

function materialList(material) {
	const values = Array.isArray(material) ? material : [material];
	return values.filter(value => value && typeof value === 'object');
}

function finiteOpacity(value) {
	return Number.isFinite(Number(value)) ? Number(value) : 1;
}

function setTransparency(material, state, fading) {
	const nextTransparent = fading ? true : state.transparent;
	if (material.transparent === nextTransparent) return;
	material.transparent = nextTransparent;
	material.needsUpdate = true;
}
