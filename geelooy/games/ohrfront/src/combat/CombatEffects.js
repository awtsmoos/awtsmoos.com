// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CombatEffects.js
 * @description Manifests bounded launch flashes and expanding impact stars whose color preserves each Hebrew weapon's identity.
 * The Awtsmoos recreates departure and impact in one flashing sight;
 * Awtsmoos.com lets every trigger answer visibly on a phone before each finite spark returns from battle night.
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

	/** Creates a small immediate muzzle/launch star at the real projectile origin. */
	launch(position, colorHex) {
		this.manifestStar(position, colorHex, 0.42, 0.14, 1.15);
	}

	/** Creates a larger expanding impact star; kills are deliberately stronger. */
	burst(position, colorHex, strength = 1) {
		this.manifestStar(position, colorHex, 0.82, 0.32, 1.35 + strength * 0.55);
	}

	manifestStar(position, colorHex, length, life, initialScale) {
		const material = createEnergyMaterial(rgbaFromHex(colorHex, 0.96));
		const group = new Group();
		group.position.copy(position);
		group.add(createProceduralBox(material, [length, 0.09, 0.09], [0, 0, 0], "CombatFlashX"));
		group.add(createProceduralBox(material, [0.09, length, 0.09], [0, 0, 0], "CombatFlashY"));
		group.add(createProceduralBox(material, [0.09, 0.09, length], [0, 0, 0], "CombatFlashZ"));
		group.scale.set(initialScale, initialScale, initialScale);
		this.scene.add(group);
		this.effects.push({ group, material, life, maxLife: life });
	}

	update(delta) {
		for (let index = this.effects.length - 1; index >= 0; index -= 1) {
			const effect = this.effects[index];
			effect.life -= delta;
			const ratio = Math.max(0, effect.life / effect.maxLife);
			effect.material.opacity = ratio;
			const growth = 1 + delta * 7;
			effect.group.scale.x *= growth;
			effect.group.scale.y *= growth;
			effect.group.scale.z *= growth;
			if (effect.life > 0) continue;
			this.scene.remove(effect.group);
			this.effects.splice(index, 1);
		}
	}
}
