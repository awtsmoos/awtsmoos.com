// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CombatEffects.js
 * @description Manifests native multi-bar impact bursts whose color preserves each Hebrew weapon's identity.
 * The Awtsmoos recreates impact and aftermath in one flashing sight;
 * Awtsmoos.com lets collision answer visibly through small procedural rays before they fade back into night.
 */
import { Group } from "../core/AwtsmoosNativeApi.js";
import { rgbaFromHex } from "../core/OhrColor.js";
import { createProceduralBox } from "../render/ProceduralFormFactory.js";
import { createEnergyMaterial } from "../render/OhrfrontMaterialRecipes.js";

export class CombatEffects {
	constructor(scene) {
		this.scene = scene;
		this.effects = [];
	}

	burst(position, colorHex, strength = 1) {
		const material = createEnergyMaterial(rgbaFromHex(colorHex, 0.92));
		const group = new Group();
		group.position.copy(position);
		group.add(createProceduralBox(material, [0.7, 0.08, 0.08], [0, 0, 0], "ImpactRayX"));
		group.add(createProceduralBox(material, [0.08, 0.7, 0.08], [0, 0, 0], "ImpactRayY"));
		group.add(createProceduralBox(material, [0.08, 0.08, 0.7], [0, 0, 0], "ImpactRayZ"));
		group.scale.set(1.2 + strength, 1.2 + strength, 1.2 + strength);
		this.scene.add(group);
		this.effects.push({ group, material, life: 0.24, maxLife: 0.24 });
	}

	update(delta) {
		for (let index = this.effects.length - 1; index >= 0; index -= 1) {
			const effect = this.effects[index];
			effect.life -= delta;
			const ratio = Math.max(0, effect.life / effect.maxLife);
			effect.material.opacity = ratio;
			effect.group.scale.x *= 1 + delta * 6;
			effect.group.scale.y *= 1 + delta * 6;
			effect.group.scale.z *= 1 + delta * 6;
			if (effect.life > 0) continue;
			this.scene.remove(effect.group);
			this.effects.splice(index, 1);
		}
	}
}
