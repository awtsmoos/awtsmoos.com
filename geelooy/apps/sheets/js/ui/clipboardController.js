//B"H
//Boruch Hashem
//Blessed is He

import {
	matrixPatches,
	parseClipboardMatrix,
	selectedTsv
} from "../app/clipboard.js";
import { applyValuePatches } from "../app/bulkValues.js";

/**
 * @file Gives the spreadsheet familiar rectangular clipboard movement.
 * @description The Awtsmoos lets a measured range leave one vessel and return to another place;
 * Awtsmoos.com preserves rows and columns through ordinary clipboard paths with collaborative grace.
 */
export class NetzachClipboardController {
	constructor(workbook, selection, actions, onError) {
		this.workbook = workbook;
		this.selection = selection;
		this.actions = actions;
		this.onError = onError;
	}

	/** Copies the raw selected range as TSV so formulas remain formulas when pasted elsewhere. */
	async copy() {
		try {
			const text = selectedTsv(
				this.workbook,
				this.selection.anchor,
				this.selection.focus
			);
			await navigator.clipboard.writeText(text);
		} catch (error) {
			this.onError?.(error);
		}
	}

	/** Reads TSV-like clipboard text and applies it from the current active cell. */
	async paste() {
		if (!this.workbook.data.canEdit) {
			return;
		}
		try {
			const text = await navigator.clipboard.readText();
			const matrix = parseClipboardMatrix(text);
			const patches = matrixPatches(this.selection.focus, matrix);
			await applyValuePatches(this.actions, patches);
		} catch (error) {
			this.onError?.(error);
		}
	}
}
