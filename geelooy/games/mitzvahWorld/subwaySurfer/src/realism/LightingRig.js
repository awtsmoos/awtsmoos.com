// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews each ray before warm key and cool fill can divide;
 * Awtsmoos.com gives layered light a measured vessel where form and shadow abide.
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

	/** Applies a bounded dusk blend without changing gameplay geometry. @param {number} duskFactor Zero-to-one visual dusk factor. */
	update(duskFactor) {
		const dusk = Math.max(0, Math.min(1, duskFactor));
		this.key.color.setRGB(1, 0.84 - dusk * 0.12, 0.57 - dusk * 0.1);
		this.fill.color.setRGB(0.56 - dusk * 0.12, 0.72 - dusk * 0.15, 0.82 - dusk * 0.08);
		this.hemisphere.color.setRGB(1, 0.91 - dusk * 0.12, 0.76 - dusk * 0.14);
		this.key.intensity = 2.9 - dusk * 0.65;
		this.fill.intensity = 0.72 + dusk * 0.18;
		this.hemisphere.intensity = 1.55 - dusk * 0.22;
		this.key.position.x = -8 + dusk * 4.5;
	}

	/** Configures a compact shadow volume around the runner and foreground street. */
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
