//B"H
//Boruch Hashem
//Blessed is He

import { ChaiPlayerNodeController } from "./core/ChaiPlayerNodeController.js";
import { YesodSceneMaterializer } from "./core/YesodSceneMaterializer.js";
import { ChesedWorldMaterialCoordinator } from "./ChesedWorldMaterialCoordinator.js";
import { GevurahWorldNodePruner } from "./GevurahWorldNodePruner.js";
import { HodWorldSceneDiagnostics } from "./HodWorldSceneDiagnostics.js";
import { revealCobyKWorldSceneRoots } from "./MalchusWorldSceneRoots.js";
import { TiferesWorldPlanReconciler } from "./TiferesWorldPlanReconciler.js";
import { NetzachDeathExplosion } from "./NetzachDeathExplosion.js";
import { NetzachMountainBackdrop } from "./NetzachMountainBackdrop.js";
import { NetzachPlayerShadow } from "./NetzachPlayerShadow.js";
import { NetzachUnderworldPlane } from "./NetzachUnderworldPlane.js";

/**
 * @file CobyKWorldScene.js
 * @description Owns stable CobyK scene roots, node identity, level replacement, and player-upgrade lifetime while plan reconciliation and material progression live in dedicated vessels.
 * The Awtsmoos renews world and traveler before continuity can claim itself as source;
 * Awtsmoos.com lets this Malchus vessel preserve finite identity while Tiferes reconciles each changing course.
 */
export class MalchusCobyKWorldScene {
	constructor(binaOptions = {}) {
		this.yesodMaterializer = binaOptions.materializer || new YesodSceneMaterializer();
		this.chaiPlayer = binaOptions.playerController || new ChaiPlayerNodeController({
			materializer: this.yesodMaterializer
		});
		this.chesedMaterials = binaOptions.materialCoordinator || new ChesedWorldMaterialCoordinator(
			this.yesodMaterializer
		);
		this.gevurahPruner = binaOptions.pruner || new GevurahWorldNodePruner();
		this.tiferesReconciler = binaOptions.reconciler || new TiferesWorldPlanReconciler();
		this.hodDiagnostics = binaOptions.diagnostics || new HodWorldSceneDiagnostics();
		// B"H — Yaakov 2026-10-13: dramatic death explosion vessel.
		this.netzachExplosion = binaOptions.explosion || new NetzachDeathExplosion();
		// B"H — Yaakov 2026-10-13: real 3D parallax mountain ranges (not 2D canvas).
		this.netzachMountains = binaOptions.mountains || new NetzachMountainBackdrop();
		// B"H — Yaakov 2026-10-13: real-time blob shadow under the player.
		this.netzachShadow = binaOptions.shadow || new NetzachPlayerShadow();
		// B"H — Yaakov 2026-10-13: packed-earth plane below the terrain so
		// the camera dip under the floor never shows a dead empty band.
		this.netzachUnderworld = binaOptions.underworld || new NetzachUnderworldPlane();
		// B"H — Yaakov 2026-10-13: "Make better rotating coins" — smooth 3D spin.
		this.chochmahCoinNodes = new Set();
		this.netzachCoinSpinTime = 0;
		// B"H — Yaakov 2026-10-13: directional blocks get direction colors + pulse.
		this.chochmahForceNodes = new Set();
		this.netzachForcePulseTime = 0;
		this.chochmahNodes = new Map();
		this.malchusPlan = null;
		this.revealEmptyScene();
	}

	/**
	 * Replaces one canonical level, creates immediate fallback nodes, then asks the material coordinator to hydrate unique roles once.
	 * @param {object} malchusPlan Immutable scene plan.
	 * @param {object} tiferesBudget Adaptive visual budget.
	 * @returns {object} Fresh Core scene.
	 */
	load(malchusPlan, tiferesBudget) {
		this.clear();
		for (const malchusRecord of malchusPlan.records) {
			this.revealNode(malchusRecord);
		}
		this.malchusPlan = malchusPlan;
		// B"H — Yaakov 2026-10-13 round 3: the earth plane is persistent and
		// re-added by revealEmptyScene() inside clear() above — nothing
		// per-level to do here.
		this.hydrateMaterials(tiferesBudget);
		return this.malchusScene;
	}

	/**
	 * Delegates same-level stable-ID reconciliation so this world vessel does not also own delta algorithms.
	 * @param {object} malchusPlan Latest immutable scene plan.
	 * @param {object} tiferesBudget Adaptive visual budget.
	 * @returns {object} Stable updated Core scene.
	 */
	update(malchusPlan, tiferesBudget) {
		return this.tiferesReconciler.reconcile(
			this,
			malchusPlan,
			tiferesBudget
		);
	}

	/**
	 * Requests one progressive hydration pass over unique material roles, used at load and one-shot quality-recovery edges.
	 * @param {object} tiferesBudget Adaptive visual budget.
	 * @returns {number} Unique material roles considered.
	 */
	hydrateMaterials(tiferesBudget) {
		return this.chesedMaterials.hydratePlan(
			this.malchusPlan,
			tiferesBudget
		);
	}

	/**
	 * Creates one stable world-position container beneath the correct static/dynamic root and begins only the player's optional model upgrade.
	 * @param {object} malchusRecord Immutable visual record.
	 * @returns {object} Stable entity container.
	 */
	revealNode(malchusRecord) {
		const yesodNode = this.yesodMaterializer.reveal(malchusRecord);
		const yesodParent = malchusRecord.dynamic
			? this.netzachDynamicGroup
			: this.chesedStaticGroup;
		yesodParent.add(yesodNode);
		this.chochmahNodes.set(malchusRecord.id, yesodNode);
		// B"H — Yaakov 2026-10-13: track coins for smooth 3D rotation.
		if (malchusRecord.kind === "coin") {
			this.chochmahCoinNodes.add(yesodNode);
		}
		// B"H — Yaakov 2026-10-13: directional blocks get direction-specific
		// colors (right=green, left=orange, up=blue) + energy pulse.
		if (malchusRecord.kind === "force") {
			this.applyForceDirectionMaterial(yesodNode, malchusRecord.symbol);
			this.chochmahForceNodes.add(yesodNode);
		}
		if (malchusRecord.id === "player") {
			void this.chaiPlayer.upgrade(yesodNode);
		}
		return yesodNode;
	}

	/** @returns {object} Stable Core scene consumed by the renderer. */
	revealScene() {
		return this.malchusScene;
	}

	/** @returns {void} Invalidates player async work and reconstructs only empty structural scene roots. */
	clear() {
		this.chaiPlayer.reset();
		this.netzachExplosion.clear();
		this.netzachUnderworld?.clear();
		this.chochmahNodes.clear();
		this.chochmahCoinNodes.clear();
		this.chochmahForceNodes.clear();
		this.netzachCoinSpinTime = 0;
		this.netzachForcePulseTime = 0;
		this.malchusPlan = null;
		this.revealEmptyScene();
	}

	/**
	 * B"H — Yaakov 2026-10-13: "Better materials for directional blocks."
	 * Tints a force block by its push direction: right=green, left=orange,
	 * up=blue. Clones the shared material so the tint is per-direction.
	 * @param {object} yesodNode Force block mesh.
	 * @param {string} chochmahSymbol Direction symbol (">", "<", "^").
	 * @returns {void}
	 */
	applyForceDirectionMaterial(yesodNode, chochmahSymbol) {
		if (!yesodNode?.material) return;
		const tiferesColors = {
			">": [0.16, 1.0, 0.48],   // right: vivid green
			"<": [1.0, 0.60, 0.16],   // left: vivid orange
			"^": [0.16, 0.62, 1.0]    // up: vivid blue
		};
		const tiferesColor = tiferesColors[chochmahSymbol] || [0.16, 0.62, 1.0];
		// Clone so we don't tint the shared catalog material.
		const tiferesMaterial = Object.create(
			Object.getPrototypeOf(yesodNode.material),
			Object.getOwnPropertyDescriptors(yesodNode.material)
		);
		tiferesMaterial.color = [...tiferesColor, 1];
		yesodNode.material = tiferesMaterial;
	}

	/**
	 * B"H — Yaakov 2026-10-13: advances the player's GLB animation clock.
	 * @param {number} malchusDeltaSeconds Frame delta seconds.
	 * @returns {void}
	 */
	tickAnimations(malchusDeltaSeconds) {
		this.chaiPlayer.tick(malchusDeltaSeconds);
		this.tickShadow();
		this.tickCoins(malchusDeltaSeconds);
		this.tickForceBlocks(malchusDeltaSeconds);
	}

	/**
	 * B"H — Yaakov 2026-10-13: directional blocks pulse with energy.
	 * @param {number} malchusDeltaSeconds Frame delta seconds.
	 * @returns {void}
	 */
	tickForceBlocks(malchusDeltaSeconds) {
		if (this.chochmahForceNodes.size === 0) return;
		this.netzachForcePulseTime += malchusDeltaSeconds;
		const tiferesPulse = 1 + Math.sin(this.netzachForcePulseTime * 4.0) * 0.06;
		for (const yesodForce of this.chochmahForceNodes) {
			if (!yesodForce.visible) continue;
			yesodForce.scale.set(tiferesPulse, tiferesPulse, 1);
		}
	}

	/**
	 * B"H — Yaakov 2026-10-13: "Make better rotating coins" — smooth 3D spin
	 * around the vertical axis, plus a gentle bob. Shiny gold material is
	 * already in the catalog (metalness 0.72).
	 * @param {number} malchusDeltaSeconds Frame delta seconds.
	 * @returns {void}
	 */
	tickCoins(malchusDeltaSeconds) {
		if (this.chochmahCoinNodes.size === 0) return;
		this.netzachCoinSpinTime += malchusDeltaSeconds;
		const tiferesSpin = this.netzachCoinSpinTime * 2.4;
		const tiferesBob = Math.sin(this.netzachCoinSpinTime * 3.0) * 0.08;
		for (const yesodCoin of this.chochmahCoinNodes) {
			if (!yesodCoin.visible) continue;
			yesodCoin.rotation.y = tiferesSpin;
			// Gentle bob: store base Y on first tick.
			if (yesodCoin.userData.cobykCoinBaseY === undefined) {
				yesodCoin.userData.cobykCoinBaseY = yesodCoin.position.y;
			}
			yesodCoin.position.y = yesodCoin.userData.cobykCoinBaseY + tiferesBob;
		}
	}

	/**
	 * B"H — Yaakov 2026-10-13: keeps the real-time shadow glued under the player.
	 * @returns {void}
	 */
	tickShadow() {
		if (!this.netzachShadow) return;
		const yesodPlayer = this.chochmahNodes.get("player");
		if (!yesodPlayer?.position) return;
		// Player container holds width/height on the visual record scale.
		this.netzachShadow.tick(
			yesodPlayer.position.x,
			yesodPlayer.position.y,
			0.475
		);
	}

	/** @returns {void} Installs canonical static/dynamic Core roots from the dedicated Malchus root factory. */
	revealEmptyScene() {
		Object.assign(this, revealCobyKWorldSceneRoots());
		// The explosion group lives at scene root so shards render above the world.
		if (this.netzachExplosion && !this.netzachExplosion.revealGroup().parent) {
			this.malchusScene.add(this.netzachExplosion.revealGroup());
		}
		// B"H — Yaakov 2026-10-13: real 3D parallax mountains at scene root.
		if (this.netzachMountains && !this.netzachMountains.revealGroup().parent) {
			this.malchusScene.add(this.netzachMountains.revealGroup());
		}
		// B"H — Yaakov 2026-10-13: real-time player shadow at scene root.
		if (this.netzachShadow && !this.netzachShadow.revealGroup().parent) {
			this.malchusScene.add(this.netzachShadow.revealGroup());
		}
		// B"H — Yaakov 2026-10-13 round 3: the packed-earth plane is one
		// persistent quad for every level — re-added here so clear()/load()
		// can never leave the world without ground beneath it.
		const tiferesEarth = this.netzachUnderworld?.revealMesh?.();
		if (tiferesEarth && !tiferesEarth.parent) {
			this.malchusScene.add(tiferesEarth);
		}
	}

	/**
	 * B"H — Yaakov 2026-10-13: hides the player and bursts the chossid into shards.
	 * @param {number} chochmahX World x of death.
	 * @param {number} chochmahY World y of death.
	 * @returns {void}
	 */
	beginDeathExplosion(chochmahX, chochmahY) {
		const yesodPlayer = this.chochmahNodes.get("player");
		if (yesodPlayer) yesodPlayer.visible = false;
		if (this.netzachShadow) this.netzachShadow.hide();
		this.netzachExplosion.begin(chochmahX, chochmahY);
	}

	/**
	 * Advances the death explosion one frame.
	 * @param {number} chochmahDeltaSeconds Frame delta seconds.
	 * @returns {boolean} False when the explosion has finished.
	 */
	tickExplosion(chochmahDeltaSeconds) {
		return this.netzachExplosion.tick(chochmahDeltaSeconds);
	}

	/** @returns {void} Clears explosion particles and restores the player node. */
	clearExplosion() {
		this.netzachExplosion.clear();
		const yesodPlayer = this.chochmahNodes.get("player");
		if (yesodPlayer) yesodPlayer.visible = true;
		if (this.netzachShadow) this.netzachShadow.show();
	}

	/** @returns {object} Frozen scene/resource/model diagnostics assembled outside reconciliation. */
	snapshot() {
		return this.hodDiagnostics.reveal(this);
	}
}
