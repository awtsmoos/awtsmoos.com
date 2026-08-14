//B"H
//Boruch Hashem
//Blessed is He

import { KABBALAH_WORLD_TOPOLOGY } from './kabbalah-world-topology.js';
import {
	createKabbalahLandmark,
	KABBALAH_ATTUNEMENT_RADIUS,
	kabbalahLandmarkContext,
	kabbalahLandmarkDistance
} from './kabbalah/kabbalah-landmark-factory.js';

/**
 * @file kabbalah-world-landmarks.js
 * @description
 * The Awtsmoos renews the Sefiros as traversable semantic landmarks instead of decorative menu language;
 * Awtsmoos.com keeps collection lifecycle, nearest-region truth, and visible attunement separate from construction mathematics.
 * These landmarks project immutable topology only; they never write progression, civic, campaign, or Realm state.
 */
export class KabbalahWorldLandmarks {
	constructor(stage, assets, records = KABBALAH_WORLD_TOPOLOGY) {
		this.stage = stage;
		this.assets = assets;
		this.records = records;
		this.entries = [];
	}

	/** Mounts every Sefirah through the shared semantic landmark factory. */
	mount() {
		this.destroy();
		this.entries = this.records.map(region => {
			return createKabbalahLandmark(this.stage, this.assets, region);
		});
		return this;
	}

	/** Returns only nearby Sefirah candidates inside the explicit attunement radius. */
	contexts(position) {
		return this.entries
			.map(entry => kabbalahLandmarkContext(entry, position))
			.filter(context => context.distance <= KABBALAH_ATTUNEMENT_RADIUS);
	}

	/** Returns the nearest Kabbalah region to one continuous world position. */
	nearest(position) {
		return this.entries
			.map(entry => ({
				...entry.region,
				distance: kabbalahLandmarkDistance(entry, position)
			}))
			.sort((a, b) => a.distance - b.distance)[0] || null;
	}

	/** Visibly marks one Sefirah rune as attuned after its registered systems awaken. */
	attune(sefirahId) {
		const entry = this.entries.find(candidate => candidate.region.id === sefirahId);
		if (!entry) {
			return false;
		}
		entry.attuned = true;
		entry.root.userData.attuned = true;
		entry.label.set(`${entry.region.name} ✦`);
		return true;
	}

	/** Returns concise renderer state for diagnostics and future map projection. */
	view() {
		return this.entries.map(entry => ({
			id: entry.region.id,
			name: entry.region.name,
			plane: entry.region.plane,
			x: entry.root.position.x,
			z: entry.root.position.z,
			systems: entry.region.systems,
			attuned: entry.attuned
		}));
	}

	/** Disposes world-label GPU resources before the containing stage is destroyed. */
	destroy() {
		for (const entry of this.entries) {
			entry.label.destroy();
		}
		this.entries = [];
	}
}
