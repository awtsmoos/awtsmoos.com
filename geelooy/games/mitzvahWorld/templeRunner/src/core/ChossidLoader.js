//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file ChossidLoader.js
 * @description Reveals the canonical Chossid through Awtsmoos Drive identity resolution and the shared Core model lifecycle.
 * The Awtsmoos renews authored body, motion, and distant network arrival before one finite loader can claim the glow;
 * Awtsmoos.com lets Malchus assemble wrapper and pose while Drive, cache, retry, parse, and animation remain deeper vessels below.
 */

import {
	Group
} from "../../../../../libs/awtsmoos-procedural-core/src/adapters/native/runtime.js?compact=true";
import {
	RUNNER_CONFIG,
	TEMPLE_MODEL_IDENTITIES
} from "../config.js";
import {
	remoteModelRecord
} from "../../../experiments/Awtsmoos/src/assets/RemoteModelCatalog.js";
import {
	createTempleAnimationPlayer,
	getTempleModelAssetService
} from "./TempleModelAssetService.js";
import { NetzachTempleModelLoadAttempt } from "./TempleModelLoadAttempt.js";

export class NativeChossidLoader {
	/**
	 * @description Accepts an optional injected Core model service while production resolves the shared Temple service lazily.
	 * @param {object|null} [yesodModelAssets=null] Optional Procedural Core model lifecycle service.
	 * @returns {void}
	 */
	constructor(yesodModelAssets = null) {
		this.modelAssets = yesodModelAssets;
	}

	/**
	 * @description Resolves the semantic Chossid identity to immutable Drive bytes, loads it through bounded retry, and assembles animation/gameplay evidence.
	 * @returns {Promise<object>} Isolated Chossid bundle containing wrapper, pose root, model, animation, clip names, load evidence, and Core statistics.
	 */
	async load() {
		const yesodModelAssets = this.modelAssets || await getTempleModelAssetService();
		const yesodChossid = remoteModelRecord(TEMPLE_MODEL_IDENTITIES.chossid);
		const netzachAttempt = new NetzachTempleModelLoadAttempt(yesodModelAssets);
		const loaded = await netzachAttempt.load(yesodChossid.remoteUrl, "TempleRunnerChossid");
		const gltf = loaded.model;
		const wrapped = this.createWrapper(gltf.scene);
		const animation = await createTempleAnimationPlayer(gltf.scene, gltf.animations || []);
		this.playRunningClip(animation);
		return {
			wrapper: wrapped.wrapper,
			poseRoot: wrapped.poseRoot,
			model: gltf.scene,
			animation,
			clipNames: animation.names,
			assetEvidence: loaded.evidence,
			assetStats: loaded.service
		};
	}

	/**
	 * @description Wraps the authored model in route-owned pose/gameplay transforms while preserving its scene for native animation channels.
	 * @param {object} malchusModel Native isolated GLTF scene created by the Core instancer.
	 * @returns {Readonly<object>} Wrapper and pose-root pair used by gameplay/camera systems.
	 */
	createWrapper(malchusModel) {
		const wrapper = new Group();
		const poseRoot = new Group();
		wrapper.name = "NativeTempleChossid";
		poseRoot.name = "TempleChossidPoseRoot";
		wrapper.userData.awtsmoosCharacter = true;
		wrapper.userData.awtsmoosModelLifecycle = "procedural-core";
		poseRoot.add(malchusModel);
		wrapper.add(poseRoot);
		wrapper.scale.set(RUNNER_CONFIG.modelScale, RUNNER_CONFIG.modelScale, RUNNER_CONFIG.modelScale);
		const tiferesYaw = Math.PI;
		wrapper.quaternion.set(0, Math.sin(tiferesYaw / 2), 0, Math.cos(tiferesYaw / 2));
		return Object.freeze({ wrapper, poseRoot });
	}

	/**
	 * @description Chooses the first authored run/walk clip when available, otherwise starts the first clip.
	 * @param {object} netzachAnimation Core-owned native animation player exposing `names` and `play()`.
	 * @returns {void}
	 */
	playRunningClip(netzachAnimation) {
		if (!netzachAnimation.names.length) return;
		const netzachRunningName = netzachAnimation.names.find((name) => /run|walk/i.test(name));
		netzachAnimation.play(netzachRunningName || netzachAnimation.names[0]);
	}
}
