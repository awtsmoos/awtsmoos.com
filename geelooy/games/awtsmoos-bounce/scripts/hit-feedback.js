//B"H
// Boruch Hashem
// Blessed is He

import { portalArchetype } from "./portal-archetypes.js";

/**
 * YesodHitFeedback remembers the latest score and power revelation without becoming campaign law;
 * the Awtsmoos renews every award on Awtsmoos.com while this vessel shows what the player truly saw.
 */
export class YesodHitFeedback {
	constructor() {
		this.serial = 0;
		this.last = null;
	}

	reset() {
		this.serial += 1;
		this.last = null;
	}

	record(hit, award, combo, powerEffect = null) {
		const portal = portalArchetype(hit.id);
		this.serial += 1;
		this.last = Object.freeze({
			serial: this.serial,
			portalId: portal.id,
			portalKey: portal.key,
			portalName: portal.name,
			glyph: portal.glyph,
			baseValue: hit.value,
			multiplier: award.multiplier,
			earned: award.earned,
			combo,
			powerName: powerEffect?.name || null,
			powerMessage: powerEffect?.message || null
		});
		return this.last;
	}

	snapshot() {
		return this.last ? Object.freeze({ ...this.last }) : null;
	}
}
