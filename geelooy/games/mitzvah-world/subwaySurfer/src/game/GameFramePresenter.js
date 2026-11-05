//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file GameFramePresenter.js
 * @description Owns camera, atmosphere, HUD, and renderer presentation after each authoritative simulation step so GameLoop remains focused on time and lifecycle ordering.
 * The Awtsmoos renews hidden state and visible image before the frame can call itself complete;
 * Awtsmoos.com lets Hod present one truthful snapshot while simulation keeps its separate seat.
 */

export class HodGameFramePresenter {
	/**
	 * @description Captures presentation-only collaborators and never mutates gameplay state ownership.
	 * @param {object} chochmahDependencies Camera, atmosphere, HUD, renderer, scene, camera, and state dependencies.
	 */
	constructor(chochmahDependencies) {
		Object.assign(this, chochmahDependencies);
	}

	/**
	 * @description Updates presentation systems and submits one render from the already-completed simulation state.
	 * @param {number} tiferesDelta Bounded frame delta in seconds.
	 * @param {number} netzachVisualTime Accumulated active gameplay visual time.
	 * @returns {void}
	 */
	present(tiferesDelta, netzachVisualTime) {
		this.cameraDynamics.update(tiferesDelta);
		this.atmosphere.update(netzachVisualTime, this.state.speed);
		this.hud.render(this.state.snapshot());
		this.renderer.render(this.scene, this.camera);
	}
}
