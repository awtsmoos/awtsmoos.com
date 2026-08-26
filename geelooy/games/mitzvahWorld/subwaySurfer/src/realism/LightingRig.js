//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file LightingRig.js
 * @description Maintains a warm key, cool fill, and sky-ground blend while their existing transforms evolve through a restrained day arc.
 * The Awtsmoos renews each ray before warm key and cool fill can divide;
 * Awtsmoos.com gives layered light a measured vessel where form, shadow, and changing hour abide.
 */

export class OhrLightingRig {
	/** @param {object} THREE Three.js namespace. @param {object} scene Target scene. @param {object} profile Quality profile. */
	constructor(THREE, scene, profile) {
		this.THREE = THREE;
		this.scene = scene;
		this.profile = profile;
		this.hemisphere = null;
		this.key = null;
		this.fill = null;
	}

	/** Creates one warm key, cool fill, and ambient sky/ground blend. @returns {OhrLightingRig} */
	create() {
		const THREE = this.THREE;
		this.hemisphere = new THREE.HemisphereLight(0xffeac2, 0x27404b, 1.55);
		this.key = new THREE.DirectionalLight(0xffd692, 2.9);
		this.fill = new THREE.DirectionalLight(0x8fb8ce, 0.72);
		this.key.position.set(-8, 15, 6);
		this.fill.position.set(9, 7, 3);
		this.key.castShadow = true;
		this.key.shadow.mapSize.set(this.profile.shadowMapSize, this.profile.shadowMapSize);
		this.key.shadow.bias = -0.00035;
		this.key.shadow.normalBias = 0.025;
		this.configureShadowCamera();
		this.scene.add(this.hemisphere, this.key, this.fill);
		return this;
	}

	/** @param {number} duskFactor Zero-to-one dusk. @param {number} phase Zero-to-one day cycle phase. */
	update(duskFactor, phase = 0) {
		const dusk = Math.max(0, Math.min(1, duskFactor));
		const arc = phase * Math.PI * 2;
		this.key.color.setRGB(1, 0.84 - dusk * 0.12, 0.57 - dusk * 0.1);
		this.fill.color.setRGB(0.56 - dusk * 0.12, 0.72 - dusk * 0.15, 0.82 - dusk * 0.08);
		this.hemisphere.color.setRGB(1, 0.91 - dusk * 0.12, 0.76 - dusk * 0.14);
		this.key.intensity = 2.9 - dusk * 0.65;
		this.fill.intensity = 0.72 + dusk * 0.18;
		this.hemisphere.intensity = 1.55 - dusk * 0.22;
		this.key.position.x = -8 + Math.sin(arc) * 2.2 + dusk * 2.2;
		this.key.position.y = 15 - dusk * 2.1;
		this.key.position.z = 6 + Math.cos(arc) * 1.4;
	}

	/** Configures a compact shadow volume around runner and foreground street. */
	configureShadowCamera() {
		const camera = this.key.shadow.camera;
		camera.left = -15;
		camera.right = 15;
		camera.top = 18;
		camera.bottom = -8;
		camera.near = 0.5;
		camera.far = 48;
	}
}
