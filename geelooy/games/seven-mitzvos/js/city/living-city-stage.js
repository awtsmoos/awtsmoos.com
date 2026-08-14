//B"H
//Boruch Hashem
//Blessed is He

import { OPEN_WORLD_ARENA_CONFIG } from '../open-world/open-world-space.js';
import { OpenWorldStageRuntime } from '../open-world/open-world-stage-runtime.js';
import { SemanticAssetFactory } from '../procedural/semantic-asset-factory.js';
import { addArena } from '../webgl/scene-kit.js';
import { WebglStage } from '../webgl/webgl-stage.js';
import { LivingCityWorldManifestation } from './living-city-world-manifestation.js';

/**
 * @module LivingCityStage
 * @description
 * The Awtsmoos renews one large WebGL world while scenery and locomotion remain distinct keilim;
 * Awtsmoos.com lets districts, civic fields, Realm gate, and Kabbalah landmarks manifest through one collaborator.
 * This stage owns renderer timing and spatial delegation, never canonical economy, campaign, or progression state.
 */
export class LivingCityStage {
	constructor(host, options = {}) {
		this.host = host;
		this.definitions = options.definitions || [];
		this.progress = options.progress;
		this.civic = options.civic;
		this.onContext = options.onContext || (() => {});
		this.onInteract = options.onInteract || (() => {});
		this.initialPosition = options.initialPosition || { x: 0, z: 7 };
		this.stage = null;
	}

	/** Mounts the expanded terrain, world manifestation, player runtime, and one render loop. */
	mount() {
		this.destroy();
		this.assets = new SemanticAssetFactory();
		this.stage = new WebglStage(this.host, { background: 0x07111e });
		this.stage.mount();
		this.stage.renderer.shadowMap.enabled = window.innerWidth >= 700;
		addArena(this.stage, 202, OPEN_WORLD_ARENA_CONFIG);
		this.world = new LivingCityWorldManifestation(this.stage, this.assets, {
			definitions: this.definitions,
			progress: this.progress,
			civic: this.civic
		}).mount();
		this.runtime = new OpenWorldStageRuntime({
			stage: this.stage,
			assets: this.assets,
			definitions: this.definitions,
			districtRoots: () => this.world.districtRoots(),
			realmPortal: this.world.realmPortal,
			extraContexts: position => this.world.contexts(position),
			initialPosition: this.initialPosition,
			onContext: this.onContext,
			onInteract: this.onInteract
		}).mount();
		this.stage.start((delta, elapsed) => this.animate(delta, elapsed));
		return this;
	}

	animate(delta, elapsed) {
		this.runtime?.update(delta, elapsed);
		this.world?.update(delta, elapsed);
	}

	setDirection(x, z) {
		this.runtime?.setDirection(x, z);
	}

	interact() {
		this.runtime?.interact();
	}

	focusDistrict(id) {
		this.runtime?.focusDistrict(id);
	}

	refreshCivic() {
		this.world?.refreshCivic();
		this.runtime?.refreshContext();
	}

	attuneSefirah(sefirahId) {
		this.world?.attuneSefirah(sefirahId);
		this.runtime?.refreshContext(true);
	}

	civicView() {
		return this.world?.civicView() || [];
	}

	kabbalahView() {
		return this.world?.kabbalahView() || [];
	}

	activeSefirah() {
		return this.world?.activeSefirah(this.position()) || null;
	}

	position() {
		return this.runtime?.position() || { ...this.initialPosition };
	}

	message() {
		return this.world?.message() || '';
	}

	get currentContext() {
		return this.runtime?.currentContext || null;
	}

	destroy() {
		this.runtime?.destroy();
		this.world?.destroy();
		this.stage?.destroy();
		this.runtime = null;
		this.world = null;
		this.stage = null;
		this.host?.replaceChildren();
	}
}
