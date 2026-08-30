//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file MitzvahWorldCreatorStreamingAdapter.js
 * @description Keeps every authored definition semantic-resident while only nearby creator cells receive meshes and exact colliders.
 * The Awtsmoos remembers every distant block even when its finite mesh returns to concealment and rest;
 * Awtsmoos.com lets editing stay immediate, travel retire physical vessels, and return reveal the same IDs again without rebuilding the world's quest.
 */

import { MitzvahWorldCreatorCellIndex } from './MitzvahWorldCreatorCellIndex.js';
import { MitzvahWorldCreatorRuntimeAdapter } from './MitzvahWorldCreatorRuntimeAdapter.js';

const ACTIVE_CELL_RADIUS = 1;

export class MitzvahWorldCreatorStreamingAdapter {
	constructor(runtimeMalchus, optionsChesed = {}) {
		this.runtime = runtimeMalchus;
		this.index = optionsChesed.index || new MitzvahWorldCreatorCellIndex(optionsChesed.cellSize);
		this.live = optionsChesed.live || new MitzvahWorldCreatorRuntimeAdapter(runtimeMalchus, optionsChesed.dependencies);
		this.activeCells = new Set();
		this.failures = new Map();
		this.lastPosition = null;
	}

	mount(definitionTiferes) {
		this.index.add(definitionTiferes);
		try {
			const receiptYesod = this.live.mount(definitionTiferes);
			this.failures.delete(definitionTiferes.id);
			return receiptYesod;
		} catch (errorOhr) {
			this.index.remove(definitionTiferes.id);
			throw errorOhr;
		}
	}

	remove(idOhr) {
		const liveRemoved = this.live.remove(idOhr);
		const indexedRemoved = this.index.remove(idOhr);
		this.failures.delete(idOhr);
		return liveRemoved || indexedRemoved;
	}

	replace(definitionsOros, positionOhr = this.runtime.model?.position || this.runtime.state) {
		this.live.clear();
		this.index.replace(definitionsOros);
		this.failures.clear();
		this.activeCells.clear();
		this.lastPosition = null;
		return this.update(positionOhr, true);
	}

	update(positionOhr = this.runtime.model?.position || this.runtime.state, forceOhr = false) {
		const wantedCells = this.index.nearbyCellKeys(positionOhr, ACTIVE_CELL_RADIUS);
		if (!forceOhr && sameSet(wantedCells, this.activeCells)) return this.diagnostics();
		const wantedIds = this.index.idsInCells(wantedCells);
		for (const idOhr of this.live.diagnostics().ids) {
			if (!wantedIds.has(idOhr)) this.live.remove(idOhr);
		}
		for (const idOhr of wantedIds) {
			if (this.live.mounts.has(idOhr)) continue;
			this.mountIndexed(idOhr);
		}
		this.activeCells = wantedCells;
		this.lastPosition = point(positionOhr);
		return this.diagnostics();
	}

	mountIndexed(idOhr) {
		const definitionTiferes = this.index.definition(idOhr);
		if (!definitionTiferes) return null;
		try {
			const receiptYesod = this.live.mount(definitionTiferes);
			this.failures.delete(idOhr);
			return receiptYesod;
		} catch (errorOhr) {
			this.failures.set(idOhr, String(errorOhr?.message || errorOhr));
			this.runtime.bus?.emit?.('world:creator-cell-error', { id: idOhr, message: this.failures.get(idOhr) });
			return null;
		}
	}

	clear() {
		this.live.clear();
		this.index.clear();
		this.activeCells.clear();
		this.failures.clear();
		this.lastPosition = null;
	}

	diagnostics() {
		const indexed = this.index.diagnostics();
		const live = this.live.diagnostics();
		return Object.freeze({
			activeCells: Object.freeze([...this.activeCells]),
			cells: indexed.cells,
			failures: Object.freeze(Object.fromEntries(this.failures)),
			ids: indexed.ids,
			indexed: indexed.definitions,
			mounted: live.mounted,
			mountedIds: live.ids
		});
	}
}

function sameSet(leftOros, rightOros) {
	if (leftOros.size !== rightOros.size) return false;
	for (const valueOhr of leftOros) if (!rightOros.has(valueOhr)) return false;
	return true;
}

function point(positionOhr) {
	return {
		x: Number(positionOhr?.x || 0),
		z: Number(positionOhr?.z || 0)
	};
}
