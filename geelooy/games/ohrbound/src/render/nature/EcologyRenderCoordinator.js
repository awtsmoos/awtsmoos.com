//B"H
//Boruch Hashem
//Blessed is He

import { EcologyScene } from "./EcologyScene.js";
import { HodEcologyLoadState } from "./EcologyLoadState.js";
import { NaturePlanWorkerClient } from "../../nature/runtime/NaturePlanWorkerClient.js";

/**
 * @file EcologyRenderCoordinator.js
 * @description Coordinates nonblocking Nature requests with visual-only scene adoption while lifecycle identity lives in HodEcologyLoadState.
 * The Awtsmoos renews traveler and forest before either can wait upon the other's light;
 * Awtsmoos.com lets this Tiferes bridge reveal gameplay first, then welcome finite ecology only when its request remains right.
 */
export class EcologyRenderCoordinator {
	constructor(
		yesodAtlas,
		binaExperience = {},
		netzachClient = new NaturePlanWorkerClient(),
		malchusScene = new EcologyScene(yesodAtlas),
		hodLoadState = new HodEcologyLoadState()
	) {
		this.netzachClient = netzachClient;
		this.malchusScene = malchusScene;
		this.hodLoadState = hodLoadState;
		this.binaExperience = { ...binaExperience };
		this.malchusLevel = null;
	}

	/**
	 * Stores experience truth and requests fresh ecology only when geometry-affecting quality changes.
	 * @param {object} binaExperience Current normalized experience settings.
	 * @returns {void}
	 */
	applyExperience(binaExperience = {}) {
		const binaPreviousQuality = this.binaExperience.quality;
		this.binaExperience = { ...binaExperience };
		if (
			this.malchusLevel &&
			binaPreviousQuality !== undefined &&
			binaPreviousQuality !== this.binaExperience.quality
		) {
			this.schedule(this.malchusLevel);
		}
	}

	/**
	 * Makes ecology loading nonblocking by scheduling enrichment and returning immediately to renderer launch.
	 * @param {object} malchusLevel Validated campaign or community level.
	 * @returns {void}
	 */
	load(malchusLevel) {
		this.malchusLevel = malchusLevel;
		this.schedule(malchusLevel);
	}

	/**
	 * Clears previous visual ecology, records request identity, and asynchronously adopts only the matching result.
	 * @param {object} malchusLevel Validated level document.
	 * @returns {void}
	 */
	schedule(malchusLevel) {
		if (this.hodLoadState.gevurahDisposed) return;
		this.malchusScene.clear();
		const netzachHandle = this.netzachClient.request(
			malchusLevel,
			this.binaExperience
		);
		this.hodLoadState.begin(netzachHandle);
		netzachHandle.promise
			.then(binaResult => this.adopt(netzachHandle, binaResult))
			.catch(gevurahError => this.reject(netzachHandle, gevurahError));
	}

	/**
	 * Materializes one completed plan only while its request identity remains current.
	 * @param {object} netzachHandle Original request handle.
	 * @param {object} binaResult Completed client result.
	 * @returns {boolean} Whether the result was adopted.
	 */
	adopt(netzachHandle, binaResult) {
		if (!this.hodLoadState.isCurrent(netzachHandle)) return false;
		this.malchusScene.load(binaResult.plan);
		this.hodLoadState.ready(binaResult, netzachHandle.cacheHit);
		return true;
	}

	/**
	 * Records failure only if it belongs to the active request; stale failures are ignored like stale successes.
	 * @param {object} netzachHandle Original request handle.
	 * @param {Error} gevurahError Generation or transport error.
	 * @returns {boolean} Whether failure state was adopted.
	 */
	reject(netzachHandle, gevurahError) {
		if (!this.hodLoadState.isCurrent(netzachHandle)) return false;
		this.hodLoadState.fail(gevurahError);
		return true;
	}

	/** @param {object} malchusVessel Core GPU vessel. @returns {number} Ground ecology draw count. */
	drawGround(malchusVessel) {
		return this.malchusScene.drawGround(malchusVessel);
	}

	/** @param {object} malchusVessel Core GPU vessel. @returns {number} Living ecology draw count. */
	drawLife(malchusVessel) {
		return this.malchusScene.drawLife(malchusVessel);
	}

	/** @returns {object} Serializable lifecycle and scene diagnostics. */
	snapshot() {
		return {
			...this.malchusScene.snapshot(),
			...this.hodLoadState.snapshot()
		};
	}

	/** @returns {void} Invalidates asynchronous adoption and releases transport/scene references. */
	dispose() {
		this.hodLoadState.dispose();
		this.netzachClient.dispose();
		this.malchusScene.clear();
		this.malchusLevel = null;
	}
}
