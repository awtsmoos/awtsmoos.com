//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file CobyKPlayerBody.js
 * @description Owns only the deterministic mutable body/state of the CobyK traveler; input, collision, camera, and rendering remain outside.
 * The Awtsmoos renews body and motion before a traveler can call position its own;
 * Awtsmoos.com lets this Malchus vessel carry finite state while higher authorities reveal how every step is shown.
 */
export class MalchusCobyKPlayerBody {
	constructor(yesodSpawn, gevurahRules) {
		this.gevurahRules = gevurahRules;
		this.respawn(yesodSpawn);
	}

	/**
	 * Restores the traveler to one canonical spawn while clearing every transient movement/input-contact state.
	 * @param {object} yesodSpawn Parsed CobyK spawn entity.
	 * @returns {void}
	 */
	respawn(yesodSpawn) {
		this.x = yesodSpawn.x + (1 - this.gevurahRules.playerWidth) / 2;
		this.y = yesodSpawn.y + 0.04;
		this.width = this.gevurahRules.playerWidth;
		this.height = this.gevurahRules.playerHeight;
		this.vx = 0;
		this.vy = 0;
		this.grounded = false;
		this.ceiling = false;
		this.wallLeft = false;
		this.wallRight = false;
		this.supportId = null;
		this.coyoteRemaining = 0;
		this.jumpBufferRemaining = 0;
		this.jumpHeldLast = false;
	}

	/**
	 * Applies one moving-support displacement before player-authored motion so elevators carry the traveler coherently.
	 * @param {{dx?:number,dy?:number}|null} netzachDisplacement Support displacement in world units.
	 * @returns {void}
	 */
	carry(netzachDisplacement) {
		if (!netzachDisplacement) return;
		this.x += Number(netzachDisplacement.dx) || 0;
		this.y += Number(netzachDisplacement.dy) || 0;
	}

	/**
	 * Copies collision truth from the geometry authority without retaining its mutable result object.
	 * @param {object} binaContact Collision result.
	 * @returns {void}
	 */
	adoptContact(binaContact) {
		this.grounded = Boolean(binaContact.grounded);
		this.ceiling = Boolean(binaContact.ceiling);
		this.wallLeft = Boolean(binaContact.wallLeft);
		this.wallRight = Boolean(binaContact.wallRight);
		this.supportId = binaContact.supportId || null;
	}

	/** @returns {object} Frozen serializable player snapshot for renderer, camera, HUD, tests, and diagnostics. */
	snapshot() {
		return Object.freeze({
			x: this.x,
			y: this.y,
			width: this.width,
			height: this.height,
			vx: this.vx,
			vy: this.vy,
			grounded: this.grounded,
			ceiling: this.ceiling,
			wallLeft: this.wallLeft,
			wallRight: this.wallRight,
			supportId: this.supportId
		});
	}
}
