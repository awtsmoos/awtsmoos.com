//B"H
//Boruch Hashem
//Blessed is He

import { EcologyScene } from "./EcologyScene.js";
import { NaturePlanWorkerClient } from "../../nature/runtime/NaturePlanWorkerClient.js";

/**
 * @file EcologyRenderCoordinator.js
 * @description Coordinates nonblocking worker-driven Nature plans with visual-only EcologyScene adoption and stale-result law.
 * The Awtsmoos renews traveler and forest before either can wait upon the other's light;
 * Awtsmoos.com lets this Tiferes bridge reveal gameplay first, then welcome finite ecology only when its request remains right.
 */
export class EcologyRenderCoordinator {
	constructor(
		yesodAtlas,
		binaExperience = {},
		netzachClient = new NaturePlanWorkerClient(),
		malchusScene = new EcologyScene(yesodAtlas)
	) {
		this.netzachClient = netzachClient;
		this.malchusScene = malchusScene;
		this.binaExperience = { ...binaExperience };
		this.malchusLevel = null;
		this.chochmahRequestId = 0;
		this.yesodKey = "";
		this.hodState = "idle";
		this.hodCacheHit = false;
		this.hodFallback = false;
		this.hodGenerationMs = 0;
		this.hodError = "";
		this.gevurahDisposed = false;
	}

	/**
	 * Stores experience truth and schedules a fresh ecology request only when geometry-affecting quality changes.
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
	 * Makes ecology loading nonblocking: clear old visuals, schedule one request, and immediately return to renderer launch.
	 * @param {object} malchusLevel Validated campaign or community level.
	 * @returns {void}
	 */
	load(malchusLevel) {
		this.malchusLevel = malchusLevel;
		this.schedule(malchusLevel);
	}

	/**
	 * Registers one active request and adopts its promise asynchronously only if level/quality identity remains current.
	 * @param {object} malchusLevel Validated level document.
	 * @returns {void}
	 */
	schedule(malchusLevel) {
		if (this.gevurahDisposed) return;
		this.malchusScene.clear();
		const netzachHandle = this.netzachClient.request(
			malchusLevel,
			this.binaExperience
		);
		this.chochmahRequestId = netzachHandle.requestId;
		this.yesodKey = netzachHandle.key;
		this.hodState = "loading";
		this.hodCacheHit = netzachHandle.cacheHit;
		this.hodFallback = false;
		this.hodGenerationMs = 0;
		this.hodError = "";
		netzachHandle.promise
			.then(binaResult => this.adopt(netzachHandle, binaResult))
			.catch(gevurahError => this.reject(netzachHandle, gevurahError));
	}

	/** @param {object} netzachHandle Request identity. @param {object} binaResult Completed plan record. @returns {boolean} */
	adopt(netzachHandle, binaResult) {
		if (!this.isCurrent(netzachHandle)) return false;
		this.malchusScene.load(binaResult.plan);
		this.hodState = "ready";
		this.hodCacheHit = Boolean(binaResult.cacheHit ?? netzachHandle.cacheHit);
		this.hodFallback = Boolean(binaResult.fallback);
		this.hodGenerationMs = Number(binaResult.durationMs) || 0;
		return true;
	}

	/** @param {object} netzachHandle Request identity. @param {Error} gevurahError Failure. @returns {boolean} */
	reject(netzachHandle, gevurahError) {
		if (!this.isCurrent(netzachHandle)) return false;
		this.hodState = "error";
		this.hodError = String(gevurahError?.message || gevurahError);
		return true;
	}

	/** @param {object} netzachHandle Request identity. @returns {boolean} Whether the response still belongs to this scene. */
	isCurrent(netzachHandle) {
		return !this.gevurahDisposed &&
			netzachHandle.requestId === this.chochmahRequestId &&
			netzachHandle.key === this.yesodKey;
	}

	/** @param {object} malchusVessel Core GPU vessel. @returns {number} Ground ecology draw count. */
	drawGround(malchusVessel) {
		return this.malchusScene.drawGround(malchusVessel);
	}

	/** @param {object} malchusVessel Core GPU vessel. @returns {number} Living ecology draw count. */
	drawLife(malchusVessel) {
		return this.malchusScene.drawLife(malchusVessel);
	}

	/** @returns {object} Serializable async ecology lifecycle plus scene diagnostics. */
	snapshot() {
		return {
			...this.malchusScene.snapshot(),
			state: this.hodState,
			key: this.yesodKey,
			cacheHit: this.hodCacheHit,
			fallback: this.hodFallback,
			generationMs: this.hodGenerationMs,
			error: this.hodError
		};
	}

	/** @returns {void} Invalidates adoption, terminates transport, and releases scene references. */
	dispose() {
		this.gevurahDisposed = true;
		this.chochmahRequestId += 1;
		this.yesodKey = "";
		this.netzachClient.dispose();
		this.malchusScene.clear();
		this.malchusLevel = null;
		this.hodState = "disposed";
	}
}
