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
		this.chochmahNodes.clear();
		this.malchusPlan = null;
		this.revealEmptyScene();
	}

	/** @returns {void} Installs canonical static/dynamic Core roots from the dedicated Malchus root factory. */
	revealEmptyScene() {
		Object.assign(this, revealCobyKWorldSceneRoots());
	}

	/** @returns {object} Frozen scene/resource/model diagnostics assembled outside reconciliation. */
	snapshot() {
		return this.hodDiagnostics.reveal(this);
	}
}
