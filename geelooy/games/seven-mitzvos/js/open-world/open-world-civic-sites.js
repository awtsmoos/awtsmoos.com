//B"H
//Boruch Hashem
//Blessed is He

import { civicContext } from './open-world-civic-context.js';
import { createCivicSite } from './open-world-civic-site-factory.js';

/**
 * @file open-world-civic-sites.js
 * @description
 * The Awtsmoos renews canonical parcel state as visible empty land, Farm, Sanctuary, or bounded occupancy;
 * Awtsmoos.com keeps renderer coordinates deterministic while inventory, zoning, and building identity remain kernel truth.
 * This manager projects snapshots only and never mutates civic domain state.
 */
export class OpenWorldCivicSites {
	constructor(stage, assets) {
		this.stage = stage;
		this.assets = assets;
		this.sites = [];
	}

	/** Creates stable scene roots for one canonical settlement. */
	mount(settlement) {
		this.sites = (settlement?.parcels || []).map((parcel, index) => {
			const site = createCivicSite(this.assets, parcel, index);
			this.stage.add(site.root, true);
			return site;
		});
		this.refresh(settlement);
		return this;
	}

	/** Reprojects canonical parcel occupancy onto already-mounted visual children. */
	refresh(settlement) {
		const parcels = new Map((settlement?.parcels || []).map(parcel => [parcel.id, parcel]));
		for (const site of this.sites) {
			const parcel = parcels.get(site.parcelId);
			const building = parcel?.building || null;
			site.empty.visible = !building;
			site.farm.visible = building === 'farm';
			site.sanctuary.visible = building === 'sanctuary';
			site.occupied.visible = Boolean(
				building && building !== 'farm' && building !== 'sanctuary'
			);
			site.root.userData.building = building;
		}
	}

	/** Returns current proximity records for empty Farm-zoned parcels only. */
	contexts(position, settlement) {
		const parcels = new Map((settlement?.parcels || []).map(parcel => [parcel.id, parcel]));
		return this.sites
			.map(site => civicContext(
				site,
				parcels.get(site.parcelId),
				settlement,
				position
			))
			.filter(Boolean);
	}

	/** Returns concise scene state for diagnostics and browser verification. */
	view() {
		return this.sites.map(site => ({
			parcelId: site.parcelId,
			building: site.root.userData.building || null,
			x: site.root.position.x,
			z: site.root.position.z
		}));
	}
}
