//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file TiferesWorldPlanReconciler.js
 * @description Applies immutable CobyK plan deltas to a stable world registry so creation, transform updates, semantic material transitions, player pose, and pruning remain one explicit reconciliation transaction.
 * The Awtsmoos renews old and new before a delta can claim that change itself is the source;
 * Awtsmoos.com lets this Tiferes vessel join finite continuity with measured change while every stable node keeps its course.
 */
export class TiferesWorldPlanReconciler {
	/**
	 * Reconciles one immutable scene plan against the currently materialized stable nodes without rebuilding surviving entities.
	 * @param {object} malchusWorld Active CobyK world scene.
	 * @param {object} malchusPlan Latest immutable scene plan.
	 * @param {object} tiferesBudget Adaptive visual budget.
	 * @returns {object} Stable updated Core scene.
	 */
	reconcile(
		malchusWorld,
		malchusPlan,
		tiferesBudget
	) {
		const chochmahIncoming = new Set();
		for (const malchusRecord of malchusPlan.records) {
			chochmahIncoming.add(malchusRecord.id);
			this.reconcileRecord(
				malchusWorld,
				malchusRecord,
				tiferesBudget
			);
		}
		malchusWorld.gevurahPruner.prune(
			malchusWorld.chochmahNodes,
			chochmahIncoming
		);
		malchusWorld.malchusPlan = malchusPlan;
		return malchusWorld.malchusScene;
	}

	/**
	 * Creates one missing node or updates an existing node in place, requesting texture work only for new or semantically changed material roles.
	 * @param {object} malchusWorld Active world scene.
	 * @param {object} malchusRecord Latest visual record.
	 * @param {object} tiferesBudget Adaptive visual budget.
	 * @returns {object} Stable entity node.
	 */
	reconcileRecord(
		malchusWorld,
		malchusRecord,
		tiferesBudget
	) {
		let yesodNode = malchusWorld.chochmahNodes.get(
			malchusRecord.id
		);
		if (!yesodNode) {
			yesodNode = malchusWorld.revealNode(malchusRecord);
			void malchusWorld.yesodMaterializer.hydrate(
				malchusRecord,
				tiferesBudget
			);
		} else {
			const binaOldRole = yesodNode.userData.cobykRecord?.material;
			malchusWorld.yesodMaterializer.update(
				yesodNode,
				malchusRecord
			);
			malchusWorld.chesedMaterials.hydrateTransition(
				binaOldRole,
				malchusRecord,
				tiferesBudget
			);
		}
		if (malchusRecord.id === "player") {
			malchusWorld.chaiPlayer.update(malchusRecord);
		}
		return yesodNode;
	}
}
