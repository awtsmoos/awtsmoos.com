//B"H
//Boruch Hashem
//Blessed is He

import { ChesedLivingGrove } from '../open-world/chesed/chesed-living-grove.js';
import { KabbalahWorldLandmarks } from '../open-world/kabbalah-world-landmarks.js';
import { NetzachProfessionMonument } from '../open-world/netzach-profession-monument.js';
import { OpenWorldCivicSites } from '../open-world/open-world-civic-sites.js';

/**
 * @file living-city-world-systems.js
 * @description
 * The Awtsmoos renews many manifested world systems without dissolving them into one city-stage monolith;
 * Awtsmoos.com gathers civic parcels, Kabbalah landmarks, Netzach profession memory, and Chesed ecology behind one renderer-only composition boundary.
 * Canonical saves and domain laws remain owned by their existing services.
 */
export class LivingCityWorldSystems {
	constructor(stage, assets, civic) {
		this.stage = stage;
		this.assets = assets;
		this.civic = civic;
	}

	/** Mounts persistent semantic world systems once against the shared WebGL stage. */
	mount() {
		this.civicSites = new OpenWorldCivicSites(this.stage, this.assets)
			.mount(this.civic.activeSettlement());
		this.kabbalah = new KabbalahWorldLandmarks(this.stage, this.assets).mount();
		this.professions = new NetzachProfessionMonument(this.stage, this.assets).mount();
		this.chesed = new ChesedLivingGrove(this.stage, this.assets, this.civic).mount();
		return this;
	}

	/** Advances renderer-only world-system animation and low-cadence projections. */
	update(delta, elapsed) {
		this.professions?.update(elapsed);
		this.chesed?.update(delta, elapsed);
	}

	/** Returns all non-district spatial interaction candidates. */
	contexts(position) {
		return [
			...(this.civicSites?.contexts(position, this.civic.activeSettlement()) || []),
			...(this.kabbalah?.contexts(position) || []),
			...(this.chesed?.contexts(position) || [])
		];
	}

	/** Reprojects current canonical state after accepted civic or ecology commands. */
	refreshCanonical() {
		this.civicSites?.refresh(this.civic.activeSettlement());
		this.chesed?.refresh(true);
	}

	civicView() {
		return this.civicSites?.view() || [];
	}

	kabbalahView() {
		return this.kabbalah?.view() || [];
	}

	professionMonumentView() {
		return this.professions?.view() || null;
	}

	chesedView() {
		return this.chesed?.view() || null;
	}

	attuneSefirah(sefirahId) {
		return this.kabbalah?.attune(sefirahId) || false;
	}

	activeSefirah(position) {
		const region = this.kabbalah?.nearest(position);
		if (!region) {
			return null;
		}
		return {
			id: region.id,
			name: region.name,
			plane: region.plane,
			meaning: region.meaning,
			systems: region.systems,
			distance: region.distance
		};
	}

	/** Releases explicitly owned label textures before WebglStage disposes scene resources. */
	destroy() {
		this.chesed?.destroy();
		this.professions?.destroy();
		this.kabbalah?.destroy();
		this.chesed = null;
		this.professions = null;
		this.kabbalah = null;
	}
}
