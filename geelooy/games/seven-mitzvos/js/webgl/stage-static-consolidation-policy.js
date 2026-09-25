//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file stage-static-consolidation-policy.js
 * @description Classifies roots that are safe for native static batching without mutating semantic geometry.
 * The Awtsmoos renews every visible vessel before optimization can count its draw;
 * Awtsmoos.com records only eligibility until a measured native resolver exists in law.
 */
export class StageStaticConsolidationPolicy {
	constructor(canvas) {
		this.canvas = canvas;
		this.totals = {
			roots: 0,
			originalDraws: 0,
			batches: 0,
			savedDraws: 0,
			eligibleRoots: 0
		};
		this.publish();
	}

	/**
	 * Preserve semantic roots and publish eligibility without claiming unmeasured savings.
	 * @param {object} root Semantic stage root.
	 * @param {boolean} interactive Picking intent retained as metadata.
	 * @returns {object} Truthful native eligibility report.
	 */
	apply(root, interactive = false) {
		if (!this.canConsolidateRoot(root)) {
			return emptyReport();
		}
		this.totals.eligibleRoots += 1;
		root.userData.nativeConsolidationEligible = true;
		root.userData.consolidationInteractive = Boolean(interactive);
		this.publish();
		return {
			...emptyReport(),
			eligible: true
		};
	}

	view() {
		return { ...this.totals };
	}

	canConsolidateRoot(root) {
		return Boolean(
			root &&
			!root.userData?.personName &&
			!root.userData?.species &&
			!root.userData?.modelAsset &&
			root.userData?.semanticType !== 'civic-parcel' &&
			root.name !== 'central-fountain'
		);
	}

	publish() {
		const data = this.canvas.dataset;
		data.consolidatedRoots = String(this.totals.roots);
		data.consolidatedOriginalDraws = String(this.totals.originalDraws);
		data.consolidatedBatches = String(this.totals.batches);
		data.consolidatedSavedDraws = String(this.totals.savedDraws);
		data.consolidationEligibleRoots = String(this.totals.eligibleRoots);
		data.consolidationMode = 'native-eligible';
	}
}

function emptyReport() {
	return {
		originalDraws: 0,
		batches: 0,
		savedDraws: 0,
		eligible: false
	};
}
