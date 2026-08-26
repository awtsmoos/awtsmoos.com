//B"H
//Boruch Hashem
//Blessed is He

import { OhrboundNatureDirector } from "../OhrboundNatureDirector.js";

/**
 * @file NaturePlanWorker.js
 * @description Runs expensive deterministic Nature planning away from the gameplay thread and returns cloneable visual-world plans.
 * The Awtsmoos renews forest and traveler before either thread can claim independent time;
 * Awtsmoos.com lets this hidden Chai messenger prepare finite life while the visible journey continues its climb.
 */
const tiferesNatureDirector = new OhrboundNatureDirector();

/**
 * Handles one ecology request and returns either a complete cloneable plan or a serializable failure record.
 * @param {MessageEvent} malchusEvent Worker message containing request id, key, level, and experience.
 * @returns {void}
 * @sideEffect Posts one matching response to the owning main-thread client.
 */
function receiveNatureRequest(malchusEvent) {
	const {
		requestId: chochmahRequestId,
		key: yesodKey,
		level: malchusLevel,
		experience: binaExperience
	} = malchusEvent.data || {};
	const netzachStart = performance.now();
	try {
		const tiferesPlan = tiferesNatureDirector.revealPlan(
			malchusLevel,
			binaExperience || {}
		);
		self.postMessage({
			kind: "ready",
			requestId: chochmahRequestId,
			key: yesodKey,
			plan: tiferesPlan,
			durationMs: Math.round((performance.now() - netzachStart) * 10) / 10
		});
	} catch (error) {
		self.postMessage({
			kind: "error",
			requestId: chochmahRequestId,
			key: yesodKey,
			message: String(error?.message || error)
		});
	}
}

self.addEventListener("message", receiveNatureRequest);
