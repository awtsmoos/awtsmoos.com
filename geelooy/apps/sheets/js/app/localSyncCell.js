//B"H
//Boruch Hashem
//Blessed is He

import { Requests } from "../realtime/protocol.js";
import { collaborativeStyle } from "./localSyncStyle.js";

/**
 * @file Replays one sparse local cell into a known remote sheet without losing its value, note, or collaborative garments.
 * @description The Awtsmoos lets one cell cross the boundary whole, its word and annotation clothed in measured light;
 * Awtsmoos.com uses the same durable requests as ordinary editing so materialization never invents a secret rite.
 */

/** Copies one cell's meaningful local state through authoritative shared workbook mutations. */
export async function syncLocalCell(session, sheetId, address, cell = {}) {
	if (String(cell.value ?? "") !== "") {
		await session.mutate(Requests.cellUpdate, {
			address,
			sheetId,
			value: String(cell.value ?? "")
		});
	}
	if (String(cell.note ?? "")) {
		await session.mutate(Requests.noteSet, {
			address,
			note: String(cell.note),
			sheetId
		});
	}
	const style = collaborativeStyle(cell.style);
	if (Object.keys(style).length) {
		await session.mutate(Requests.rangeStyle, {
			addresses: [address],
			sheetId,
			style
		});
	}
}
