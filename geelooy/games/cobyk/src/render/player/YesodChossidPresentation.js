//B"H
//Boruch Hashem
//Blessed is He

import {
	Group
} from "/libs/awtsmoos-procedural-core/src/adapters/native/runtime.js?compact=true";
import {
	createNativeAnimationPlayer
} from "/libs/awtsmoos-procedural-core/src/adapters/native/modelAssets.js?compact=true";
import { COBYK_CHOSSID_IDENTITY } from "../assets/CobyKChossidIdentity.js";
import { BinaChossidFitCache } from "./BinaChossidFitCache.js";
import { TiferesChossidPosePolicy } from "./TiferesChossidPosePolicy.js";
import {
	loadWardrobe,
	applyWardrobe,
	subscribeWardrobe
} from "/games/scripts/wardrobe/ChossidWardrobe.js";

// B"H — Yaakov 2026-10-13: play the chossid.glb built-in animations.
// Side-view platformer: walk when moving, run when fast, jump/fall when airborne.
const CHOSSID_ANIM_WALK = "walk_Armature";
const CHOSSID_ANIM_RUN = "run_Armature";
const CHOSSID_ANIM_JUMP = "jump_Armature";
const CHOSSID_ANIM_FALL = "falling_Armature";
const CHOSSID_ANIM_IDLE = "stand_Armature";
// B"H — Yaakov 2026-10-13: "if it goes too fast it should transition from walk
// to run." Was 6.0 — UNREACHABLE (maxRunSpeed is 4.8), so run never played.
// 3.2 gives a real walk→run blend at high speed (player crossfades smoothly).
const CHOSSID_RUN_SPEED = 3.2;

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
		// B"H — Yaakov 2026-10-13: GLB animation player for walk/run/jump.
		this.chaiAnimPlayer = null;
		this.malchusAnimName = null;
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
			// B"H — Yaakov 2026-10-13: hook the GLB's built-in animations.
			this.revealAnimationPlayer(chaiInstance, chaiRoot);
			// B"H — unified wardrobe: the chossid wears the user's saved look on boot,
			// and live-updates when the wardrobe changes in any game.
			this.revealWardrobe(chaiRoot);
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
	 * B"H — unified wardrobe: applies the saved look and subscribes for
	 * live updates from any game. Idempotent per presentation instance.
	 * @param {object} chaiRoot Core-native Chossid scene.
	 * @returns {void}
	 */
	revealWardrobe(chaiRoot) {
		try {
			applyWardrobe(chaiRoot, loadWardrobe());
		} catch (_) { /* wardrobe never breaks gameplay */ }
		if (this.chochmahWardrobeUnsubscribe) return;
		try {
			this.chochmahWardrobeUnsubscribe = subscribeWardrobe((cfg) => {
				try {
					if (this.chaiModelRoot) applyWardrobe(this.chaiModelRoot, cfg);
				} catch (_) { /* ignore */ }
			});
		} catch (_) { /* ignore */ }
	}

	/**
	 * Re-applies the current wardrobe (e.g. after returning to the game).
	 * @returns {void}
	 */
	refreshWardrobe() {
		try {
			if (this.chaiModelRoot) applyWardrobe(this.chaiModelRoot, loadWardrobe());
		} catch (_) { /* wardrobe never breaks gameplay */ }
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
	 * Also selects the matching GLB animation (walk/run/jump/fall/idle).
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
		this.revealAnimationFor(malchusPlayer);
		return tiferesPose;
	}

	/**
	 * B"H — Yaakov 2026-10-13: creates the GLB animation player from the
	 * instance's built-in clips (walk_Armature, run_Armature, etc.).
	 * @param {object} chaiInstance Core `loadIsolated()` result.
	 * @param {object} chaiRoot Core-native scene root.
	 * @returns {void}
	 */
	revealAnimationPlayer(chaiInstance, chaiRoot) {
		this.chaiAnimPlayer = null;
		this.malchusAnimName = null;
		try {
			const chochmahClips = chaiInstance?.animations
				|| chaiRoot?.userData?.animations
				|| [];
			if (!chochmahClips.length) return;
			this.chaiAnimPlayer = createNativeAnimationPlayer(chaiRoot, chochmahClips);
		} catch (gevurahError) {
			this.chaiAnimPlayer = null;
		}
	}

	/**
	 * B"H — Yaakov 2026-10-13: picks walk/run/jump/fall/idle from velocity.
	 * @param {object} malchusPlayer Player snapshot with vx/vy.
	 * @returns {void}
	 */
	revealAnimationFor(malchusPlayer = {}) {
		if (!this.chaiAnimPlayer) return;
		const netzachVx = Math.abs(Number(
			malchusPlayer.vx ?? malchusPlayer.velocity?.x
		) || 0);
		const netzachVy = Number(
			malchusPlayer.vy ?? malchusPlayer.velocity?.y
		) || 0;
		let tiferesAnim = CHOSSID_ANIM_IDLE;
		if (netzachVy > 0.5) {
			tiferesAnim = CHOSSID_ANIM_JUMP;
		} else if (netzachVy < -0.5) {
			tiferesAnim = CHOSSID_ANIM_FALL;
		} else if (netzachVx >= CHOSSID_RUN_SPEED) {
			tiferesAnim = CHOSSID_ANIM_RUN;
		} else if (netzachVx > 0.15) {
			tiferesAnim = CHOSSID_ANIM_WALK;
		}
		if (tiferesAnim !== this.malchusAnimName) {
			try {
				this.chaiAnimPlayer.play(tiferesAnim);
				this.malchusAnimName = tiferesAnim;
			} catch (gevurahError) {
				this.malchusAnimName = tiferesAnim;
			}
		}
	}

	/**
	 * B"H — Yaakov 2026-10-13: advances the GLB animation clock.
	 * Call once per frame with delta seconds.
	 * @param {number} malchusDeltaSeconds Frame delta.
	 * @returns {void}
	 */
	tick(malchusDeltaSeconds) {
		try {
			this.chaiAnimPlayer?.update?.(malchusDeltaSeconds);
		} catch (gevurahError) {
			// Animation is decorative; never break the frame.
		}
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
		this.chaiAnimPlayer = null;
		this.malchusAnimName = null;
		try {
			if (this.chochmahWardrobeUnsubscribe) this.chochmahWardrobeUnsubscribe();
		} catch (_) { /* ignore */ }
		this.chochmahWardrobeUnsubscribe = null;
	}
}
