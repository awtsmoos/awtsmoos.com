//B"H
//Boruch Hashem
//Blessed is He

import { FrameCostSample } from '../../../../libs/awtsmoos-procedural-core/src/exports/performance.js';

/**
 * @file stage-render-loop.js
 * @description
 * The Awtsmoos renews every RAF before motion can divide into gameplay, camera, detail, visibility, instancing, shadows, material, and render work;
 * Awtsmoos.com lets this Netzach-like loop preserve causal update order while bounded shadow refresh scheduling remains measurable beside every other subsystem in the 60 Hz covenant.
 * It owns RAF timing only and never owns scene state, shadow depth rendering, visibility policy, batch identity, material law, or quality policy.
 */
export class StageRenderLoop {
	constructor(options = {}) {
		Object.assign(this, options);
		this.frame = 0;
		this.lastTimestamp = 0;
		this.running = false;
	}

	/** @param {Function} updateHandler Established `(delta, elapsed)` gameplay callback. */
	start(updateHandler = () => {}) {
		this.stop();
		this.running = true;
		this.clock.start();
		const animate = timestamp => {
			if (!this.running) {
				return;
			}
			this.frame = requestAnimationFrame(animate);
			const interval = this.lastTimestamp ? timestamp - this.lastTimestamp : 0;
			this.lastTimestamp = timestamp;
			const delta = Math.min(this.clock.getDelta(), 0.05);
			const costs = new FrameCostSample();
			costs.measure('gameplay', () => updateHandler(delta, this.clock.elapsedTime));
			costs.measure('camera', () => this.cameraDirector.update(delta));
			costs.measure('detail', () => this.detailGovernor.update(delta));
			costs.measure('visibility', () => this.rootVisibility.update(delta));
			costs.measure('instances', () => this.semanticInstances.update(delta));
			costs.measure('shadows', () => this.shadowRuntime.update(delta));
			costs.measure('materials', () => {
				this.materialRuntime.update(delta, this.performance.pressure());
			});
			this.canvas.dataset.cameraMode = this.cameraDirector.mode();
			costs.measure('render', () => this.renderer.render(this.scene, this.camera));
			this.performance.sample(interval, costs.view());
		};
		this.frame = requestAnimationFrame(animate);
	}

	stop() {
		this.running = false;
		if (this.frame) {
			cancelAnimationFrame(this.frame);
		}
		this.frame = 0;
		this.lastTimestamp = 0;
	}
}
