//B"H
//Boruch Hashem
//Blessed is He

import { chesedContexts } from './chesed-context-projector.js';
import { ChesedGrovePopulation } from './chesed-grove-population.js';
import {
	applyChesedGroveVisuals,
	buildChesedGroveProjection,
	chesedGroveDiagnostic
} from './chesed-grove-projection.js';
import { buildChesedGroveScene } from './chesed-grove-scene.js';
import { ChesedResidentProjector } from './chesed-resident-projector.js';

const REFRESH_SECONDS = 1;

/**
 * @file chesed-living-grove.js
 * @description
 * The Awtsmoos renews ecology as an inhabited WebGL place whose every value still comes from one LivingWorld authority;
 * Awtsmoos.com keeps this lifecycle vessel focused on pacing, contexts, bounded actors, and renderer resources while projection details remain nearby.
 * Sanctuary and time commands never originate here.
 */
export class ChesedLivingGrove {
	constructor(stage, assets, civic) {
		this.stage = stage;
		this.assets = assets;
		this.civic = civic;
		this.residentProjector = new ChesedResidentProjector();
		this.mobile = typeof window !== 'undefined' && window.innerWidth < 700;
		this.nextRefresh = 0;
	}

	/** Mounts static scene vessels and one bounded population from canonical projection. */
	mount() {
		this.scene = buildChesedGroveScene(this.stage, this.assets);
		this.projection = buildChesedGroveProjection(
			this.civic,
			this.residentProjector,
			this.mobile
		);
		this.population = new ChesedGrovePopulation(
			this.stage,
			this.assets,
			this.scene.center
		).mount(this.projection.residents, this.projection.animals);
		applyChesedGroveVisuals(this.scene, this.projection);
		return this;
	}

	/** Animates existing actors and refreshes canonical projection at low cadence. */
	update(delta, elapsed) {
		this.population?.update(delta, elapsed);
		if (elapsed < this.nextRefresh) {
			return;
		}
		this.nextRefresh = elapsed + REFRESH_SECONDS;
		this.refresh(false);
	}

	/** Reprojects canonical state only when its compact signature changes or force is requested. */
	refresh(force = false) {
		const next = buildChesedGroveProjection(
			this.civic,
			this.residentProjector,
			this.mobile
		);
		if (!force && next.signature === this.projection?.signature) {
			return false;
		}
		this.projection = next;
		this.population?.refresh(next.residents, next.animals);
		applyChesedGroveVisuals(this.scene, next);
		return true;
	}

	contexts(position) {
		return chesedContexts(
			this.projection?.current,
			this.scene?.anchors,
			position
		);
	}

	view() {
		return chesedGroveDiagnostic(
			this.projection,
			this.population,
			this.scene?.anchors
		);
	}

	/** Releases the owned CanvasTexture before WebglStage handles shared mesh disposal. */
	destroy() {
		this.scene?.label.destroy();
		this.scene = null;
		this.population = null;
		this.projection = null;
	}
}
