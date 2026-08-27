//B"H
//Boruch Hashem
//Blessed is He

import {
	matrixPatches,
	parseClipboardMatrix,
	selectedTsv
} from "../app/clipboard.js";
import { applyValuePatches } from "../app/bulkValues.js";
import { applyRichPaste } from "../app/clipboardPasteApply.js";
import { richPasteCells } from "../app/clipboardPastePlan.js";
import { richClipboardSnapshot } from "../app/clipboardSnapshot.js";

/**
 * @file Unites interoperable system clipboard text with rich Awtsmoos spreadsheet copy semantics.
 * @description The Awtsmoos lets one copied range travel as simple text and remembered structure in light;
 * Awtsmoos.com keeps external paste familiar while formulas, notes, and garments remain available when right.
 */
export class NetzachClipboardController {
	constructor(workbook, selection, actions, onError) {
		this.workbook = workbook;
		this.selection = selection;
		this.actions = actions;
		this.onError = onError;
		this.richSnapshot = null;
	}

	/** Copies raw TSV for external apps while remembering rich source geometry for Paste Special. */
	async copy() {
		try {
			this.richSnapshot = richClipboardSnapshot(
				this.workbook,
				this.selection.anchor,
				this.selection.focus
			);
			const text = selectedTsv(
				this.workbook,
				this.selection.anchor,
				this.selection.focus
			);
			await navigator.clipboard.writeText(text);
			return this.richSnapshot;
		} catch (error) {
			this.onError?.(error);
			return null;
		}
	}

	/** Reads ordinary TSV-like clipboard text and pastes values from the active cell. */
	async paste() {
		if (!this.workbook.data.canEdit) {
			return 0;
		}
		try {
			const text = await navigator.clipboard.readText();
			const patches = matrixPatches(
				this.selection.focus,
				parseClipboardMatrix(text)
			);
			await applyValuePatches(this.actions, patches);
			return patches.length;
		} catch (error) {
			this.onError?.(error);
			return 0;
		}
	}

	/** Applies one rich Paste Special plan from the most recent in-app Copy operation. */
	async pasteSpecial(options = {}) {
		if (!this.workbook.data.canEdit) {
			return 0;
		}
		if (!this.richSnapshot) {
			const error = new Error(
				"Copy a range in Awtsmoos Sheets before using Paste Special."
			);
			this.onError?.(error);
			return 0;
		}
		try {
			const patches = richPasteCells(
				this.selection.focus,
				this.richSnapshot,
				options
			);
			await applyRichPaste(this.actions, patches);
			return patches.length;
		} catch (error) {
			this.onError?.(error);
			return 0;
		}
	}

	/** Reports whether the current page session owns a rich copy snapshot. */
	hasRichCopy() {
		return Boolean(this.richSnapshot?.cells?.length);
	}
}
