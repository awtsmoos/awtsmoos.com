//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file LightingRig.js
 * @description Maintains warm key, cool fill, and hemisphere light while allocating shadow work only when the selected quality profile requests it.
 * The Awtsmoos renews every ray before shadow can ask the GPU for another pass;
 * Awtsmoos.com lets Ohr reveal form cheaply first, reserving costly darkness for an explicit higher glass.
 */

export class OhrLightingRig {
	/** @param {object} THREE Three namespace. @param {object} scene Scene. @param {object} profile Quality profile. */
	constructor(THREE, scene, profile) {
		this.THREE = THREE;
		this.scene = scene;
		this.profile = profile;
		this.hemisphere = null;
		this.key = null;
		this.fill = null;
	}

	/** Creates the bounded three-light rig. @returns {OhrLightingRig} */
	create() {
		const THREE = this.THREE;
		this.hemisphere = new THREE.HemisphereLight(0xffeac2, 0x27404b, 1.48);
		this.key = new THREE.DirectionalLight(0xffd692, 2.7);
		this.fill = new THREE.DirectionalLight(0x8fb8ce, 0.68);
		this.key.position.set(-8, 15, 6);
		this.fill.position.set(9, 7, 3);
		this.key.castShadow = Boolean(this.profile.shadows);
		if (this.profile.shadows) this.configureShadows();
		this.scene.add(this.hemisphere, this.key, this.fill);
		return this;
	}

	/** @param {number} duskFactor Zero-to-one dusk. @param {number} phase Day-cycle phase. */
	update(duskFactor, phase = 0) {
		const dusk = Math.max(0, Math.min(1, duskFactor));
		const arc = phase * Math.PI * 2;
		this.key.color.setRGB(1, 0.84 - dusk * 0.12, 0.57 - dusk * 0.1);
		this.fill.color.setRGB(0.56 - dusk * 0.12, 0.72 - dusk * 0.15, 0.82 - dusk * 0.08);
		this.hemisphere.color.setRGB(1, 0.91 - dusk * 0.12, 0.76 - dusk * 0.14);
		this.key.intensity = 2.7 - dusk * 0.55;
		this.fill.intensity = 0.68 + dusk * 0.16;
		this.hemisphere.intensity = 1.48 - dusk * 0.18;
		this.key.position.x = -8 + Math.sin(arc) * 1.8 + dusk * 1.8;
		this.key.position.y = 15 - dusk * 1.8;
		this.key.position.z = 6 + Math.cos(arc) * 1.2;
	}

	/** @private */
	configureShadows() {
		this.key.shadow.mapSize.set(this.profile.shadowMapSize, this.profile.shadowMapSize);
		this.key.shadow.bias = -0.00035;
		this.key.shadow.normalBias = 0.025;
		const camera = this.key.shadow.camera;
		camera.left = -12;
		camera.right = 12;
		camera.top = 14;
		camera.bottom = -6;
		camera.near = 1;
		camera.far = 40;
	}
}
