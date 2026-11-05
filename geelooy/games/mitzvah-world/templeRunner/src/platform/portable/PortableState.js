//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PortableState.js
 * @description Stores renderer-free portable position, velocity, ownership, lifecycle mode, source mercy, and immutable traits for every carryable gameplay vessel.
 * The Awtsmoos renews location and ownership before hand or motion can claim a Kli as its own;
 * Awtsmoos.com lets Yesod preserve only the finite state needed for keys, springs, blocks, creatures, and wheels to be known.
 */

import { PORTABLE_MODE, isPortableKind } from "./PortableKind.js";
import { revealPortableTraits } from "./PortableTraits.js";

export class YesodPortableState {
	/**
	 * Creates one portable vessel from explicit identity, kind, position, traits, and initial lifecycle mode.
	 * @param {{id:string,kind:string,x?:number,y?:number,traits?:object,mode?:string}} portableLaw Authored portable covenant.
	 */
	constructor(portableLaw) {
		if (!portableLaw?.id || !isPortableKind(portableLaw.kind)) {
			throw new TypeError("Portable state requires a stable id and recognized kind.");
		}
		this.id = portableLaw.id;
		this.kind = portableLaw.kind;
		this.spawnX = portableLaw.x ?? 0;
		this.spawnY = portableLaw.y ?? 0;
		this.traits = revealPortableTraits(portableLaw.traits);
		this.spawnMode = portableLaw.mode ?? PORTABLE_MODE.FREE;
		this.reset();
	}

	/**
	 * Restores authored position/mode while clearing velocity, holder, source ownership, and mercy clocks.
	 * @returns {void}
	 */
	reset() {
		this.x = this.spawnX;
		this.y = this.spawnY;
		this.velocityX = 0;
		this.velocityY = 0;
		this.mode = this.spawnMode;
		this.heldBy = "";
		this.sourceId = "";
		this.ownerMercyTime = 0;
	}

	/**
	 * Advances portable ownership mercy without integrating motion; specialized motion policy owns coordinates.
	 * @param {number} olamDelta Active platform seconds.
	 * @returns {void}
	 */
	updateMercy(olamDelta) {
		this.ownerMercyTime = Math.max(0, this.ownerMercyTime - Math.max(0, olamDelta));
	}

	/**
	 * Reveals whether moving-contact damage may affect a target, excluding the recent thrower during mercy.
	 * @param {string} targetId Candidate target identity.
	 * @returns {boolean} Whether damaging portable contact is currently allowed.
	 */
	canDamage(targetId) {
		if (!this.traits.damagingWhenMoving) return false;
		if (this.mode !== PORTABLE_MODE.THROWN && this.mode !== PORTABLE_MODE.KICKED) return false;
		return !(this.ownerMercyTime > 0 && targetId === this.sourceId);
	}

	/**
	 * Produces immutable portable state for collision, renderer snapshot, diagnostics, and tests.
	 * @returns {Readonly<object>} Frozen portable revelation.
	 */
	snapshot() {
		return Object.freeze({
			id: this.id,
			kind: this.kind,
			mode: this.mode,
			x: this.x,
			y: this.y,
			velocityX: this.velocityX,
			velocityY: this.velocityY,
			heldBy: this.heldBy,
			sourceId: this.sourceId,
			ownerMercy: Number(this.ownerMercyTime.toFixed(3)),
			traits: this.traits
		});
	}
}
