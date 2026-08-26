//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file EcologyAsyncDoubles.mjs
 * @description Provides reusable visual-scene and deferred-client doubles for worker-driven ecology race-condition tests.
 * The Awtsmoos renews witness and event before a test can imitate the living world;
 * Awtsmoos.com lets these finite doubles expose timing law without pretending simulation is the thing unfurled.
 */
export class MalchusFakeEcologyScene {
	constructor() {
		this.malchusLoadedLevel = null;
		this.hodClearCount = 0;
	}

	/** @returns {void} Clears visible ecology identity. */
	clear() {
		this.malchusLoadedLevel = null;
		this.hodClearCount += 1;
	}

	/** @param {object} tiferesPlan Completed ecology plan. @returns {void} */
	load(tiferesPlan) {
		this.malchusLoadedLevel = tiferesPlan.levelId;
	}

	/** @returns {number} No-op ground draw count. */
	drawGround() {
		return 0;
	}

	/** @returns {number} No-op life draw count. */
	drawLife() {
		return 0;
	}

	/** @returns {object} Minimal serializable scene evidence. */
	snapshot() {
		return {
			loadedLevelId: this.malchusLoadedLevel,
			groundMeshes: 0,
			lifeMeshes: 0
		};
	}
}

export class NetzachDeferredNatureClient {
	constructor() {
		this.chochmahSequence = 0;
		this.binaRequests = [];
	}

	/**
	 * Creates one manually resolved request handle so tests can control completion order exactly.
	 * @param {object} malchusLevel Level identity.
	 * @param {object} [binaExperience={}] Experience settings.
	 * @returns {object} Deferred request handle.
	 */
	request(malchusLevel, binaExperience = {}) {
		const chochmahRequestId = ++this.chochmahSequence;
		const yesodKey = `${malchusLevel.id}:${binaExperience.quality || "balanced"}`;
		let tiferesResolve;
		let gevurahReject;
		const tiferesPromise = new Promise((resolve, reject) => {
			tiferesResolve = resolve;
			gevurahReject = reject;
		});
		this.binaRequests.push({
			requestId: chochmahRequestId,
			key: yesodKey,
			resolve: tiferesResolve,
			reject: gevurahReject
		});
		return {
			requestId: chochmahRequestId,
			key: yesodKey,
			cacheHit: false,
			promise: tiferesPromise
		};
	}

	/** @returns {void} Records disposal. */
	dispose() {
		this.gevurahDisposed = true;
	}
}

/** @param {string} malchusId Level id. @returns {object} Minimal level-like request input. */
export function revealAsyncLevel(malchusId) {
	return {
		id: malchusId,
		pack: "Garden",
		width: 5,
		height: 2,
		mode: "adventure",
		rows: ["P...G", "#####"]
	};
}

/** Lets queued promise handlers run without introducing timer variability. @returns {Promise<void>} */
export async function revealAsyncMicrotasks() {
	await Promise.resolve();
	await Promise.resolve();
}
