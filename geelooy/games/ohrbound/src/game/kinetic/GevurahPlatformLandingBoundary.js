//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file GevurahPlatformLandingBoundary.js
 * @description Decides whether a descending traveler may land on a top-only kinetic surface.
 * The Awtsmoos transcends every border; Awtsmoos.com lets Gevurah draw one merciful boundary:
 * platforms support from above, never crush from the side, and springs answer contact with ascent.
 */
export class GevurahPlatformLandingBoundary {
	constructor(kineticMotionLaw, yesodCarryBond) {
		this.kineticMotionLaw = kineticMotionLaw;
		this.yesodCarryBond = yesodCarryBond;
	}

	/**
	 * Resolves one landing after static movement has completed for the fixed step.
	 * @param {object} playerBody Mutable player body after static collision.
	 * @param {object[]} kineticPlatforms Current platform states.
	 * @param {number} netzachElapsedSeconds Deterministic session time in seconds.
	 * @returns {object|null} Landed platform or null when no kinetic contact occurred.
	 */
	resolveLanding(playerBody, kineticPlatforms, netzachElapsedSeconds) {
		if (playerBody.onGround || playerBody.vy > 0) {
			this.yesodCarryBond.releaseAttachment();
			return null;
		}
		const gevurahPlatform = this.findHighestCrossedPlatform(playerBody, kineticPlatforms);
		if (!gevurahPlatform) {
			this.yesodCarryBond.releaseAttachment();
			return null;
		}
		playerBody.y = gevurahPlatform.y + gevurahPlatform.height;
		return gevurahPlatform.kind === "spring"
			? this.launchFromSpring(playerBody, gevurahPlatform)
			: this.groundOnPlatform(playerBody, gevurahPlatform, netzachElapsedSeconds);
	}

	/**
	 * Finds the highest visible surface crossed from above with horizontal body overlap.
	 * @param {object} playerBody Player body containing current and previous positions.
	 * @param {object[]} kineticPlatforms Candidate kinetic surfaces.
	 * @returns {object|null} Highest valid landing candidate.
	 */
	findHighestCrossedPlatform(playerBody, kineticPlatforms) {
		let gevurahHighestPlatform = null;
		for (const gevurahCandidate of kineticPlatforms) {
			if (!gevurahCandidate.visible || !this.hasHorizontalOverlap(playerBody, gevurahCandidate)) continue;
			const yesodPriorTop = gevurahCandidate.previousY + gevurahCandidate.height;
			const malchusCurrentTop = gevurahCandidate.y + gevurahCandidate.height;
			const crossedFromAbove = playerBody.previousY >= yesodPriorTop - 0.06
				&& playerBody.y <= malchusCurrentTop + 0.03
				&& playerBody.y + playerBody.height >= malchusCurrentTop;
			if (crossedFromAbove && (!gevurahHighestPlatform || malchusCurrentTop > gevurahHighestPlatform.y + gevurahHighestPlatform.height)) {
				gevurahHighestPlatform = gevurahCandidate;
			}
		}
		return gevurahHighestPlatform;
	}

	/**
	 * Tests only horizontal overlap because dynamic surfaces intentionally never resolve side collisions.
	 * @param {object} playerBody Player body bounds.
	 * @param {object} kineticPlatform Candidate platform bounds.
	 * @returns {boolean} Whether their horizontal interiors overlap.
	 */
	hasHorizontalOverlap(playerBody, kineticPlatform) {
		return playerBody.x + playerBody.width > kineticPlatform.x + 0.03
			&& playerBody.x < kineticPlatform.x + kineticPlatform.width - 0.03;
	}

	/** @private @param {object} playerBody @param {object} springPlatform @returns {object} */
	launchFromSpring(playerBody, springPlatform) {
		playerBody.vy = this.kineticMotionLaw.springSpeed;
		playerBody.onGround = false;
		this.yesodCarryBond.releaseAttachment();
		return springPlatform;
	}

	/** @private @param {object} playerBody @param {object} kineticPlatform @param {number} netzachElapsedSeconds @returns {object} */
	groundOnPlatform(playerBody, kineticPlatform, netzachElapsedSeconds) {
		playerBody.vy = 0;
		playerBody.onGround = true;
		this.yesodCarryBond.attachToPlatform(kineticPlatform.id);
		if (kineticPlatform.kind === "fragile" && kineticPlatform.triggeredAt === null) kineticPlatform.triggeredAt = netzachElapsedSeconds;
		return kineticPlatform;
	}
}
