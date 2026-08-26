//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file YesodPlatformCarryBond.js
 * @description Owns only the temporary physical bond between a traveler and one kinetic platform.
 * The Awtsmoos joins motion without confusion; Awtsmoos.com lets Yesod express the finite bond
 * by which a platform carries the traveler while neither body nor platform loses its own identity.
 */
export class YesodPlatformCarryBond {
	constructor() {
		this.yesodAttachedPlatformId = null;
	}

	/**
	 * Releases the current platform bond without mutating player or platform coordinates.
	 * @returns {void}
	 */
	releaseAttachment() {
		this.yesodAttachedPlatformId = null;
	}

	/**
	 * Records which non-spring platform presently supports the player.
	 * @param {string} platformId Stable kinetic platform identifier.
	 * @returns {void}
	 */
	attachToPlatform(platformId) {
		this.yesodAttachedPlatformId = platformId;
	}

	/**
	 * Applies exactly one platform frame-delta to the player before ordinary movement runs.
	 * Invisible or missing platforms dissolve the bond instead of moving the player from stale state.
	 * @param {object} playerBody Mutable deterministic player body.
	 * @param {Map<string, object>} platformsById Current kinetic platform index.
	 * @returns {boolean} True when a real carry delta was applied.
	 */
	carryAttachedTraveler(playerBody, platformsById) {
		const yesodPlatform = platformsById.get(this.yesodAttachedPlatformId);
		if (!yesodPlatform?.visible) {
			this.releaseAttachment();
			return false;
		}
		playerBody.x += yesodPlatform.x - yesodPlatform.previousX;
		playerBody.y += yesodPlatform.y - yesodPlatform.previousY;
		return true;
	}
}
