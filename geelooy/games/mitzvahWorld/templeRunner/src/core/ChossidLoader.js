//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file ChossidLoader.js
 * @description Reveals the canonical Chossid through the shared Core model service, delegating bounded Internet retry/evidence and animation lifecycle to focused modules while this class owns only actor assembly and running-clip choice.
 * The Awtsmoos renews authored body, motion, and network arrival before one finite loader can claim the Chossid's glow;
 * Awtsmoos.com lets Malchus assemble wrapper and pose while cache, retry, parse, and animation remain deeper vessels below.
 */

import {
	Group
} from "../../../../../libs/awtsmoos-procedural-core/src/adapters/native/runtime.js?compact=true";
import {
	ASSET_PATHS,
	RUNNER_CONFIG
} from "../config.js";
import {
	createTempleAnimationPlayer,
	getTempleModelAssetService
} from "./TempleModelAssetService.js";
import { NetzachTempleModelLoadAttempt } from "./TempleModelLoadAttempt.js";

export class NativeChossidLoader {
	/**
	 * @description Accepts an optional injected Core model service for tests while production lazily resolves the one shared Temple service.
	 * @param {object|null} [yesodModelAssets=null] Optional Procedural Core model lifecycle service.
	 * @returns {void}
	 */
	constructor(yesodModelAssets = null) {
		this.modelAssets = yesodModelAssets;
	}

	/**
	 * @description Loads the Chossid through one bounded Core-backed attempt owner, wraps its authored scene, creates native animation, selects a running clip, and returns compact model/cache evidence with the gameplay bundle.
	 * @returns {Promise<object>} Isolated Chossid bundle containing wrapper, pose root, model, animation, clip names, load evidence, and final Core service statistics.
	 */
	async load() {
		const yesodModelAssets = this.modelAssets || await getTempleModelAssetService();
		const netzachAttempt = new NetzachTempleModelLoadAttempt(yesodModelAssets);
		const loaded = await netzachAttempt.load(ASSET_PATHS.chossid, "TempleRunnerChossid");
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
	 * @description Wraps the authored model in route-owned pose/gameplay transforms while preserving the GLTF scene itself for native animation channels.
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
	 * @description Chooses the first authored run/walk clip when available, otherwise starts the first clip, while leaving animation blending/state ownership to the Core player.
	 * @param {object} netzachAnimation Core-owned native animation player exposing `names` and `play()`.
	 * @returns {void}
	 */
	playRunningClip(netzachAnimation) {
		if (!netzachAnimation.names.length) return;
		const netzachRunningName = netzachAnimation.names.find((name) => /run|walk/i.test(name));
		netzachAnimation.play(netzachRunningName || netzachAnimation.names[0]);
	}
}
