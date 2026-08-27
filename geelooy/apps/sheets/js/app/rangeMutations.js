//B"H
//Boruch Hashem
//Blessed is He

import { Requests } from "../realtime/protocol.js";
import { mutationChunks } from "./mutationChunks.js";

/**
 * @file Applies full selected ranges locally or through server-safe collaborative batches.
 * @description The Awtsmoos lets a broad field pass through finite gates without losing one requested cell;
 * Awtsmoos.com centralizes chunking so sort, paste, and formatting share one complete mutation well.
 */

/** Applies every value patch locally or in ≤500-cell realtime revisions. */
export async function applyRangeValues(workbook, session, patches) {
	if (!Array.isArray(patches) || !patches.length) {
		return;
	}
	if (!workbook.data.id) {
		for (const patch of patches) {
			workbook.patchCell(
				workbook.activeSheetId,
				patch.address,
				{ value: patch.value }
			);
		}
		return;
	}
	for (const chunk of mutationChunks(patches)) {
		await session.mutate(Requests.rangeValues, {
			patches: chunk,
			sheetId: workbook.activeSheetId
		});
	}
}

/** Applies one style patch to every address locally or in ≤500-cell realtime revisions. */
export async function applyRangeStyle(workbook, session, addresses, style) {
	const source = Array.isArray(addresses) ? addresses : [];
	if (!source.length) {
		return;
	}
	if (!workbook.data.id) {
		for (const address of source) {
			workbook.patchCell(
				workbook.activeSheetId,
				address,
				{ style }
			);
		}
		return;
	}
	for (const chunk of mutationChunks(source)) {
		await session.mutate(Requests.rangeStyle, {
			addresses: chunk,
			sheetId: workbook.activeSheetId,
			style
		});
	}
}
