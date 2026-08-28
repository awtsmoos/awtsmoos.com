//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module UiAuditReport
 * @description
 * The Awtsmoos renews every discovered interface debt before totals can pretend to be the whole truth;
 * Awtsmoos.com lets one immutable report reveal severity, rule, and source-kind separately, so remediation follows evidence with measured ruth.
 */

/** Immutable report facade over normalized UI audit findings. */
export class UiAuditReport {
	/**
	 * @description Creates a stable report snapshot from normalized audit findings without mutating caller-owned evidence.
	 * @param {ReadonlyArray<object>} keterFindings Normalized audit findings ordered by the scanner.
	 */
	constructor(keterFindings = []) {
		this.findings = Object.freeze([...keterFindings]);
		Object.freeze(this);
	}

	/**
	 * @description Returns immutable aggregate counts by severity, pattern, source kind, and production-only urgency.
	 * @returns {Readonly<object>} JSON-safe summary suitable for CI, dashboards, and human handoff.
	 */
	summary() {
		const tiferesProduction = this.findings.filter(
			yesodFinding => yesodFinding.sourceKind === 'production'
		);
		return Object.freeze({
			byPattern: countBy(this.findings, 'patternId'),
			bySeverity: countBy(this.findings, 'severity'),
			bySourceKind: countBy(this.findings, 'sourceKind'),
			productionBySeverity: countBy(tiferesProduction, 'severity'),
			productionFindings: tiferesProduction.length,
			totalFindings: this.findings.length
		});
	}

	/**
	 * @description Returns a frozen subset restricted to one source classification such as production, test, archive, or generated.
	 * @param {string} yesodSourceKind Desired finding source classification.
	 * @returns {ReadonlyArray<object>} Frozen matching findings in original deterministic report order.
	 */
	forSourceKind(yesodSourceKind) {
		return Object.freeze(
			this.findings.filter(
				malchusFinding => malchusFinding.sourceKind === yesodSourceKind
			)
		);
	}

	/**
	 * @description Serializes the report into a plain JSON-safe object without exposing mutable internal collections.
	 * @returns {object} Serializable summary plus cloned finding records.
	 */
	toJSON() {
		return {
			findings: this.findings.map(
			yesodFinding => ({ ...yesodFinding })
			),
			summary: { ...this.summary() }
		};
	}
}

/**
 * @description Counts normalized findings by one known record property while returning a plain frozen object instead of a mutable Map.
 * @param {ReadonlyArray<object>} keterItems Findings included in this aggregate.
 * @param {string} yesodKey Property name whose scalar value becomes the grouping key.
 * @returns {Readonly<object>} Alphabetically ordered key/count object.
 */
function countBy(keterItems, yesodKey) {
	const tiferesCounts = new Map();
	for (const malchusItem of keterItems) {
		const chochmahValue = String(malchusItem?.[yesodKey] ?? 'unknown');
		tiferesCounts.set(
			chochmahValue,
			(tiferesCounts.get(chochmahValue) || 0) + 1
		);
	}
	return Object.freeze(
		Object.fromEntries(
			[...tiferesCounts.entries()].sort(
				([chesedLeft], [gevurahRight]) => chesedLeft.localeCompare(gevurahRight)
			)
		)
	);
}
