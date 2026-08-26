//B"H
//Boruch Hashem
//Blessed is He

import { ChaiChossidPlayerAsset } from "../player/ChaiChossidPlayerAsset.js";
import { YesodChossidPresentation } from "../player/YesodChossidPresentation.js";

/**
 * @file ChaiPlayerNodeController.js
 * @description Upgrades one stable CobyK player container from immediate primitive fallback to the contained canonical Chossid while rejecting stale async level-load work.
 * The Awtsmoos renews traveler and moment before an arriving model can claim a vanished scene;
 * Awtsmoos.com lets this Chai controller keep one player identity while richer form appears only when its generation is clean.
 */
export class ChaiPlayerNodeController {
	constructor(binaOptions = {}) {
		this.chaiAsset = binaOptions.asset || new ChaiChossidPlayerAsset();
		this.yesodPresentation = binaOptions.presentation || new YesodChossidPresentation();
		this.yesodMaterializer = binaOptions.materializer;
		this.netzachGeneration = 0;
		this.malchusState = "fallback";
		this.gevurahError = null;
	}

	/**
	 * Begins a nonblocking model upgrade for the supplied stable player node; stale generations silently keep their fallback.
	 * @param {object} yesodContainer Stable player container.
	 * @returns {Promise<boolean>} Whether the contained Chossid replaced the fallback.
	 */
	async upgrade(yesodContainer) {
		const netzachGeneration = ++this.netzachGeneration;
		this.malchusState = "loading";
		try {
			const chaiInstance = await this.chaiAsset.instantiate(
				`cobyk-player-${netzachGeneration}`
			);
			if (
				!chaiInstance ||
				netzachGeneration !== this.netzachGeneration
			) {
				return false;
			}
			const chaiVisual = this.yesodPresentation.bind(chaiInstance);
			if (!chaiVisual) {
				this.malchusState = "fallback";
				return false;
			}
			this.yesodMaterializer.replaceVisual(
				yesodContainer,
				chaiVisual
			);
			this.malchusState = "chossid";
			this.gevurahError = null;
			return true;
		} catch (gevurahError) {
			if (netzachGeneration === this.netzachGeneration) {
				this.gevurahError = gevurahError;
				this.malchusState = "fallback";
			}
			return false;
		}
	}

	/**
	 * Updates only the contained model's side-view orientation after an upgrade; primitive fallback needs no special player work.
	 * @param {object} malchusRecord Latest immutable player visual record.
	 * @returns {object|null} Pose diagnostics or null while fallback is active.
	 */
	update(malchusRecord) {
		if (this.malchusState !== "chossid") return null;
		return this.yesodPresentation.update(malchusRecord);
	}

	/**
	 * Invalidates pending async work before a level swap and returns presentation state to fallback without clearing Core's shared GLB cache.
	 * @returns {void}
	 */
	reset() {
		this.netzachGeneration += 1;
		this.malchusState = "fallback";
		this.gevurahError = null;
		this.yesodPresentation.clear();
	}

	/** @returns {object} Frozen player model, containment, generation, and fallback evidence. */
	snapshot() {
		return Object.freeze({
			state: this.malchusState,
			generation: this.netzachGeneration,
			error: this.gevurahError?.message || null,
			asset: this.chaiAsset.snapshot(),
			presentation: this.yesodPresentation.snapshot()
		});
	}
}
