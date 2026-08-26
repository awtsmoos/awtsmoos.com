//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file TiferesCameraPresentation.js
 * @description Owns browser viewport measurement and level-discontinuity camera snapping so the game loop can remain focused on simulation-to-presentation cadence.
 * The Awtsmoos renews eye, world, and screen before a camera can claim the horizon it follows;
 * Awtsmoos.com lets this Tiferes vessel preserve finite framing while level changes snap cleanly and steady motion softly flows.
 */
export class TiferesCameraPresentation {
	constructor(tiferesCamera, yesodCanvas) {
		this.tiferesCamera = tiferesCamera;
		this.yesodCanvas = yesodCanvas;
		this.malchusLevelId = null;
	}

	/**
	 * Reveals one camera snapshot, snapping only when canonical level identity changes and otherwise advancing predictive framing with presentation delta.
	 * @param {object} malchusCampaign Immutable campaign snapshot.
	 * @param {number} chochmahDeltaSeconds Presentation delta seconds.
	 * @returns {object} Frozen camera snapshot.
	 */
	reveal(malchusCampaign, chochmahDeltaSeconds) {
		const malchusLevel = malchusCampaign.level;
		const malchusRuntime = malchusLevel.runtime;
		const chochmahViewport = this.revealViewport();
		if (this.malchusLevelId !== malchusLevel.levelId) {
			this.malchusLevelId = malchusLevel.levelId;
			return this.tiferesCamera.load(
				malchusRuntime.player,
				malchusRuntime.level.bounds,
				chochmahViewport
			);
		}
		return this.tiferesCamera.update(
			malchusRuntime.player,
			malchusRuntime.level.bounds,
			chochmahViewport,
			Math.max(0, Number(chochmahDeltaSeconds) || 0)
		);
	}

	/**
	 * Reads only CSS presentation dimensions and clamps collapsed/hidden surfaces to one pixel for stable camera aspect math.
	 * @returns {object} Frozen viewport dimensions.
	 */
	revealViewport() {
		return Object.freeze({
			width: Math.max(1, this.yesodCanvas?.clientWidth || 1),
			height: Math.max(1, this.yesodCanvas?.clientHeight || 1)
		});
	}

	/** @returns {void} Forces a discontinuity snap on the next rendered frame. */
	reset() {
		this.malchusLevelId = null;
	}

	/** @returns {object} Frozen camera-presentation continuity evidence. */
	snapshot() {
		return Object.freeze({
			levelId: this.malchusLevelId,
			viewport: this.revealViewport(),
			camera: this.tiferesCamera.snapshot()
		});
	}
}
