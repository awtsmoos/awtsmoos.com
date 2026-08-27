//B"H
//Boruch Hashem
//Blessed is He

import {
	clampColumnWidth,
	clampRowHeight
} from "../model/structureGeometry.js";
import { Requests } from "../realtime/protocol.js";

/**
 * @file Preserves sparse row heights and column widths when a local Sheet crosses into shared Awtsmoos light.
 * @description The Awtsmoos gives dimension a measured vessel beside value and style in every living grid;
 * Awtsmoos.com carries only sparse exceptions so materialization stays faithful without making the workbook big.
 */

/** Replays all locally customized row and column dimensions onto one known remote sheet. */
export async function syncSheetGeometry(session, localSheet, remoteSheetId) {
	await syncRows(
		session,
		localSheet?.rowMeta,
		remoteSheetId
	);
	await syncColumns(
		session,
		localSheet?.columnMeta,
		remoteSheetId
	);
}

/** Persists each sparse local row height through the canonical collaborative resize request. */
async function syncRows(session, metadata = {}, sheetId) {
	for (const [key, value] of Object.entries(metadata || {})) {
		const index = Number(key);
		if (!Number.isSafeInteger(index) || index < 0) {
			continue;
		}
		await session.mutate(Requests.rowResize, {
			index,
			sheetId,
			size: clampRowHeight(value?.height)
		});
	}
}

/** Persists each sparse local column width through the canonical collaborative resize request. */
async function syncColumns(session, metadata = {}, sheetId) {
	for (const [key, value] of Object.entries(metadata || {})) {
		const index = Number(key);
		if (!Number.isSafeInteger(index) || index < 0) {
			continue;
		}
		await session.mutate(Requests.columnResize, {
			index,
			sheetId,
			size: clampColumnWidth(value?.width)
		});
	}
}
