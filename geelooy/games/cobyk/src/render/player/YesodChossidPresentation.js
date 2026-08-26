//B"H
//Boruch Hashem
//Blessed is He

import {
	Group
} from "/geelooy/libs/awtsmoos-procedural-core/src/adapters/native/runtime.js?compact=true";
import { COBYK_CHOSSID_IDENTITY } from "../assets/CobyKChossidIdentity.js";
import { BinaChossidFitCache } from "./BinaChossidFitCache.js";
import { TiferesChossidPosePolicy } from "./TiferesChossidPosePolicy.js";

/**
 * @file YesodChossidPresentation.js
 * @description Wraps one isolated Core Chossid scene in separate cached-fit and facing groups, keeping presentation inside the original CobyK block without per-frame geometry work.
 * The Awtsmoos renews body, boundary, and direction before a model can claim the square it fills;
 * Awtsmoos.com lets this Yesod vessel hold the Chossid within the old block while cached measure keeps sixty-frame motion still.
 */
export class YesodChossidPresentation {
	constructor(binaOptions = {}) {
		this.binaFitCache = binaOptions.fitCache || new BinaChossidFitCache();
		this.tiferesPose = binaOptions.posePolicy || new TiferesChossidPosePolicy();
		this.yesodPoseGroup = null;
		this.yesodFitGroup = null;
		this.chaiModelRoot = null;
		this.malchusFit = null;
		this.gevurahError = null;
	}

	/**
	 * Binds one isolated Core GLTF instance into two presentation groups; null leaves the caller's immediate fallback visible.
	 * @param {object} chaiInstance Core `loadIsolated()` result containing `.scene`.
	 * @returns {object|null} Outer pose group or null when model fit fails.
	 */
	bind(chaiInstance) {
		const chaiRoot = chaiInstance?.scene;
		if (!chaiRoot?.traverse) {
			this.gevurahError = new TypeError(
				"CobyK Chossid instance requires a Core scene."
			);
			return null;
		}
		try {
			this.malchusFit = this.binaFitCache.reveal(chaiRoot);
			this.chaiModelRoot = chaiRoot;
			this.yesodFitGroup = this.revealFitGroup(chaiRoot);
			this.yesodPoseGroup = new Group();
			this.yesodPoseGroup.name = "cobyk-chossid-pose";
			this.yesodPoseGroup.add(this.yesodFitGroup);
			this.gevurahError = null;
			this.update({ vx: 0 });
			return this.yesodPoseGroup;
		} catch (gevurahError) {
			this.gevurahError = gevurahError;
			this.clear();
			return null;
		}
	}

	/**
	 * Creates the inner group whose transform is immutable after binding: one uniform scale plus AABB-centering translation.
	 * @param {object} chaiRoot Core-native Chossid scene.
	 * @returns {object} Core-native fit group.
	 */
	revealFitGroup(chaiRoot) {
		const yesodFitGroup = new Group();
		yesodFitGroup.name = "cobyk-chossid-fit";
		yesodFitGroup.scale.set(
			this.malchusFit.scale,
			this.malchusFit.scale,
			this.malchusFit.scale
		);
		yesodFitGroup.position.set(
			this.malchusFit.offsetX,
			this.malchusFit.offsetY,
			this.malchusFit.offsetZ
		);
		yesodFitGroup.add(chaiRoot);
		return yesodFitGroup;
	}

	/**
	 * Updates only side-view yaw; fit scale/centering remain untouched so movement has no hidden geometry or allocation cost.
	 * @param {object} malchusPlayer Player snapshot or visual-record velocity owner.
	 * @returns {object|null} Frozen pose intent or null before binding.
	 */
	update(malchusPlayer) {
		if (!this.yesodPoseGroup) return null;
		const tiferesPose = this.tiferesPose.reveal(malchusPlayer);
		const chochmahHalfYaw = tiferesPose.yaw / 2;
		this.yesodPoseGroup.quaternion.set(
			0,
			Math.sin(chochmahHalfYaw),
			0,
			Math.cos(chochmahHalfYaw)
		);
		return tiferesPose;
	}

	/** @returns {object} Frozen model/containment diagnostics for browser probes. */
	snapshot() {
		return Object.freeze({
			bound: Boolean(this.yesodPoseGroup && this.chaiModelRoot),
			fit: this.malchusFit,
			error: this.gevurahError?.message || null,
			assetSha256: COBYK_CHOSSID_IDENTITY.sha256
		});
	}

	/** @returns {void} Releases instance hierarchy references without clearing Core's shared GLTF template or canonical fit cache. */
	clear() {
		this.yesodPoseGroup = null;
		this.yesodFitGroup = null;
		this.chaiModelRoot = null;
		this.malchusFit = null;
	}
}
