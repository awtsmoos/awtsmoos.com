//B"H
//Boruch Hashem
//Blessed is He

import { dynamicArrayShape } from "./arrayResult.js";
import {
	formulaError,
	isFormulaError
} from "./errors.js";
import {
	sortedFormulaAnchors,
	spillAddresses,
	storedValueBlocksSpill
} from "./spillCoordinates.js";

/**
 * @file Owns one transient calculation pass where dynamic arrays may illuminate derived cells without becoming workbook truth.
 * @description The Awtsmoos lets one anchor pour many values through a temporary map that vanishes when the calculation completes;
 * Awtsmoos.com keeps persistence untouched while cache, collision, ownership, and lazy spill discovery remain measured and complete.
 */
export class NetzachEvaluationSession {
	constructor(workbook, sheetId) {
		this.workbook = workbook;
		this.sheetId = sheetId;
		this.anchors = sortedFormulaAnchors(workbook, sheetId);
		this.results = new Map();
		this.spills = new Map();
		this.prepared = new Set();
		this.preparing = new Set();
		this.evaluateAnchor = null;
	}

	/** Attaches the evaluator callback after construction, avoiding a circular module import. */
	bindEvaluator(evaluator) {
		this.evaluateAnchor = evaluator;
		return this;
	}

	/** Returns a cached effective cell result while preserving legitimate blank/false/zero values. */
	cached(address) {
		return this.results.has(address)
			? { found: true, value: this.results.get(address) }
			: { found: false, value: null };
	}

	/** Remembers one effective cell result for this pass only. */
	remember(address, value) {
		this.results.set(address, value);
		this.prepared.add(address);
	}

	/** Returns the owning spill anchor for one projected address when known. */
	spillOwnerAt(address) {
		return this.spills.get(address)?.anchor || "";
	}

	/** Resolves a blank address from existing or lazily discovered spill projection. */
	spillValueAt(address, visiting) {
		const known = this.spills.get(address);
		if (known) {
			return { found: true, value: known.value };
		}
		for (const anchor of this.anchors) {
			if (this.prepared.has(anchor) || this.preparing.has(anchor)) {
				continue;
			}
			this.prepareAnchor(anchor, visiting);
			const projected = this.spills.get(address);
			if (projected) {
				return { found: true, value: projected.value };
			}
		}
		return { found: false, value: null };
	}

	/** Converts a raw matrix formula result into its visible anchor scalar after collision-safe registration. */
	projectResult(anchor, result) {
		const shape = dynamicArrayShape(result);
		if (!shape) {
			return result;
		}
		if (isFormulaError(shape)) {
			return shape;
		}
		if (shape.single) {
			return shape.topLeft;
		}
		const addresses = spillAddresses(
			anchor,
			shape.rows,
			shape.columns
		);
		if (isFormulaError(addresses)) {
			return addresses;
		}
		if (this.hasCollision(anchor, addresses)) {
			return formulaError("#SPILL!");
		}
		this.registerProjection(anchor, addresses, shape);
		return shape.topLeft;
	}

	/** Evaluates one not-yet-known formula anchor at most once while preventing spill-search re-entry. */
	prepareAnchor(anchor, visiting) {
		if (!this.evaluateAnchor || this.prepared.has(anchor) || this.preparing.has(anchor)) {
			return;
		}
		this.preparing.add(anchor);
		try {
			this.evaluateAnchor(anchor, visiting, this);
		} finally {
			this.preparing.delete(anchor);
			this.prepared.add(anchor);
		}
	}

	/** Returns whether persisted value or earlier derived ownership blocks any non-anchor spill target. */
	hasCollision(anchor, addresses) {
		return addresses.some((address) =>
			address !== anchor
			&& (
				storedValueBlocksSpill(this.workbook, this.sheetId, address)
				|| Boolean(this.spills.get(address)?.anchor)
			)
		);
	}

	/** Registers matrix scalars as derived addresses without creating or patching workbook cells. */
	registerProjection(anchor, addresses, shape) {
		addresses.forEach((address, index) => {
			const row = Math.floor(index / shape.columns);
			const column = index % shape.columns;
			this.spills.set(address, {
				anchor,
				value: shape.matrix[row][column]
			});
		});
	}
}
