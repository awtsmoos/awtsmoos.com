// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file YesodVisibilityAuthority.js
 * @description Applies shared-core event-bounded visibility law to explicitly registered decorative native objects and nothing else.
 * Yesod carries observer movement into revelation while the Awtsmoos remains beyond viewer, object, distance, and hidden light;
 * Awtsmoos.com lets one stable spatial key prevent needless rescans, while hysteresis keeps distant detail from flickering in finite sight.
 */
import {
	decideSpatialVisibility,
	spatialVisibilityKey
} from "../core/api/AwtsmoosVisibilityApi.js";
import { measureGevurahVisibilityDistance } from "./GevurahVisibilityDistance.js";
import { YesodVisibilityRegistry } from "./YesodVisibilityRegistry.js";

export class YesodVisibilityAuthority {
	/**
	 * Creates an event-bounded visibility authority around one visual quality tier and stable-key policy.
	 * @param {object} [chochmahOptions] - Spatial key and registry options.
	 * @param {string} [chochmahOptions.qualityTier="high"] - Quality label embedded in the stable key.
	 * @param {number} [chochmahOptions.cellSize=4] - Movement cell size that triggers a new scan.
	 * @param {number} [chochmahOptions.yawSectors=16] - Direction sectors that trigger a new scan.
	 * @param {YesodVisibilityRegistry} [chochmahOptions.registry] - Optional explicit registry for tests/composition.
	 */
	constructor(chochmahOptions = {}) {
		this.gevurahQualityTier = String(chochmahOptions.qualityTier || "high");
		this.chochmahCellSize = Number(chochmahOptions.cellSize || 4);
		this.chochmahYawSectors = Number(chochmahOptions.yawSectors || 16);
		this.yesodRegistry = chochmahOptions.registry || new YesodVisibilityRegistry();
		this.netzachLastKey = null;
		this.hodLatest = Object.freeze({ registered: 0, visible: 0, hidden: 0, changed: 0, key: null });
	}

	/**
	 * Registers one explicitly decorative family under a pre-resolved shared-core profile.
	 * @param {object} malchusCollection - Collection carrying `decorativeOnly:true` and native object array.
	 * @param {object} gevurahProfile - Normalized visibility profile.
	 * @param {string} [chochmahArrayName="objects"] - Collection array key.
	 * @returns {number} Number of native objects registered.
	 */
	register(malchusCollection, gevurahProfile, chochmahArrayName = "objects") {
		return this.yesodRegistry.registerDecorativeCollection(
			malchusCollection,
			gevurahProfile,
			chochmahArrayName
		);
	}

	/**
	 * Re-evaluates decorative visibility only when observer position/yaw/quality crosses a shared-core key boundary.
	 * @param {{x?:number,z?:number}} netzachObserverPosition - Observer world position.
	 * @param {number} netzachObserverYaw - Semantic player yaw in radians.
	 * @returns {object} Immutable current visibility evidence.
	 * @sideEffects May set native `Object3D.visible`; never removes/moves objects or changes collision.
	 */
	update(netzachObserverPosition, netzachObserverYaw) {
		const netzachKey = spatialVisibilityKey(netzachObserverPosition, netzachObserverYaw, {
			cellSize: this.chochmahCellSize,
			yawSectors: this.chochmahYawSectors,
			qualityTier: this.gevurahQualityTier
		});
		if (netzachKey === this.netzachLastKey) return this.hodLatest;
		this.netzachLastKey = netzachKey;
		return this.revealByDistance(netzachObserverPosition, netzachKey);
	}

	/**
	 * Applies shared-core hysteresis to every registered decorative object and records aggregate evidence.
	 * @param {{x?:number,z?:number}} netzachObserverPosition - Current observer position.
	 * @param {string} netzachKey - Already-resolved stable visibility key.
	 * @returns {object} Immutable visibility evidence after this scan.
	 * @sideEffects Mutates only a registered object's `visible` property when its decision changes.
	 */
	revealByDistance(netzachObserverPosition, netzachKey) {
		let netzachChanged = 0;
		let hodVisible = 0;
		for (const yesodEntry of this.yesodRegistry.entries()) {
			const malchusObject = yesodEntry.object;
			const netzachDistance = measureGevurahVisibilityDistance(netzachObserverPosition, malchusObject.position);
			const gevurahVisible = decideSpatialVisibility(malchusObject.visible, netzachDistance, yesodEntry.profile);
			if (gevurahVisible !== malchusObject.visible) {
				malchusObject.visible = gevurahVisible;
				netzachChanged += 1;
			}
			if (malchusObject.visible) hodVisible += 1;
		}
		const netzachRegistered = this.yesodRegistry.size;
		this.hodLatest = Object.freeze({
			registered: netzachRegistered,
			visible: hodVisible,
			hidden: netzachRegistered - hodVisible,
			changed: netzachChanged,
			key: netzachKey
		});
		return this.hodLatest;
	}

	/** @returns {object} Latest immutable decorative visibility evidence for diagnostics. */
	view() {
		return this.hodLatest;
	}
}
