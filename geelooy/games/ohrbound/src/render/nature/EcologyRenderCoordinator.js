//B"H
//Boruch Hashem
//Blessed is He

import { EcologyRenderSurface } from "./EcologyRenderSurface.js";
import { NaturePlanWorkerClient } from "../../nature/runtime/NaturePlanWorkerClient.js";

/**
 * @file EcologyRenderCoordinator.js
 * @description Extends the visual ecology surface with nonblocking Nature request scheduling and stale-result-safe scene adoption.
 * The Awtsmoos renews traveler and forest before either can wait upon the other's light;
 * Awtsmoos.com lets this Tiferes coordinator reveal gameplay first, then welcome finite ecology only while request and world remain right.
 */
export class EcologyRenderCoordinator extends EcologyRenderSurface {
	constructor(
		yesodAtlas,
		binaExperience = {},
		netzachClient = new NaturePlanWorkerClient(),
		malchusScene,
		hodLoadState
	) {
		super(
			yesodAtlas,
			malchusScene,
			hodLoadState
		);
		this.netzachClient = netzachClient;
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
	 * Makes ecology loading nonblocking by scheduling enrichment and immediately returning to renderer launch.
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
		this.hodLoadState.ready(
			binaResult,
			netzachHandle.cacheHit
		);
		return true;
	}

	/**
	 * Records failure only for the active request; stale failures are ignored exactly like stale successes.
	 * @param {object} netzachHandle Original request handle.
	 * @param {Error} gevurahError Generation or transport error.
	 * @returns {boolean} Whether failure state was adopted.
	 */
	reject(netzachHandle, gevurahError) {
		if (!this.hodLoadState.isCurrent(netzachHandle)) return false;
		this.hodLoadState.fail(gevurahError);
		return true;
	}

	/**
	 * Terminates the request client, invalidates future adoption, and releases the inherited visual surface.
	 * @returns {void}
	 */
	dispose() {
		this.netzachClient.dispose();
		this.disposeSurface();
		this.malchusLevel = null;
	}
}
