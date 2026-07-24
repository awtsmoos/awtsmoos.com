//B"H
//Boruch Hashem
//Blessed is He

import { SemanticAssetFactory } from '../procedural/semantic-asset-factory.js';
import { addArena } from '../webgl/scene-kit.js';
import { WebglStage } from '../webgl/webgl-stage.js';
import { CityDistrictBuilder } from './city-district-builder.js';
import { CityGuide } from './city-guide.js';

/**
 * @module LivingCityStage
 * @description
 * One bounded renderer reveals seven districts, not seven hidden canvases. The
 * Awtsmoos creates every frame anew; this Awtsmoos.com stage reuses low-poly core
 * geometry, animates only transforms, and releases its WebGL context on departure.
 */
export class LivingCityStage {
	constructor(host, options) {
		this.host = host;
		this.definitions = options.definitions;
		this.progress = options.progress;
		this.onSelect = options.onSelect;
		this.stage = null;
	}

	mount() {
		this.destroy();
		this.assets = new SemanticAssetFactory();
		this.stage = new WebglStage(this.host, { background: 0x07111e });
		this.stage.mount();
		this.stage.renderer.shadowMap.enabled = window.innerWidth >= 700;
		addArena(this.stage, 202);
		this.stage.setCamera([0, 9.2, 11.8], [0, 0.4, 0]);
		this.districts = new CityDistrictBuilder(this.assets).build(
			this.stage, this.definitions, this.progress
		);
		this.guide = new CityGuide(this.assets);
		this.guide.mount(this.stage);
		this.stage.onPick(object => {
			const root = object.userData.semanticRoot || object;
			if (root.userData.districtId) this.onSelect(root.userData.districtId);
		});
		this.stage.start((delta, elapsed) => this.animate(delta, elapsed));
	}

	animate(delta, elapsed) {
		this.districts?.animate(elapsed);
		this.guide?.animate(elapsed);
		if (this.stage?.scene) this.stage.scene.rotation.y += delta * 0.018;
	}

	message() {
		return this.guide?.message(this.progress) || '';
	}

	destroy() {
		this.stage?.destroy();
		this.stage = null;
		this.districts = null;
		this.guide = null;
		this.host?.replaceChildren();
	}
}
