//B"H
//Boruch Hashem
//Blessed is He

import { Requests } from "../realtime/protocol.js";

/**
 * @file Materializes an existing browser-local workbook into a newly created shared workbook.
 * @description The Awtsmoos loses no letter when a private draft enters a wider shared domain;
 * Awtsmoos.com carries tabs, values, notes, and styles forward so collaboration begins from home.
 */
export async function materializeLocalWorkbook(session, workbook) {
	if (workbook.data.id) {
		return workbook.data;
	}
	const localSnapshot = structuredClone(workbook.data);
	await session.create(localSnapshot.title || "Untitled workbook");
	const firstRemoteSheet = workbook.data.sheets[0];
	await syncSheet(
		session,
		localSnapshot.sheets[0],
		firstRemoteSheet.id,
		firstRemoteSheet.name
	);
	for (const localSheet of localSnapshot.sheets.slice(1)) {
		const response = await session.mutate(Requests.sheetAdd, {
			name: localSheet.name || "Sheet"
		});
		await syncSheet(
			session,
			localSheet,
			response.operation.sheet.id,
			response.operation.sheet.name
		);
	}
	return workbook.data;
}

/** Copies one local worksheet into a known server-side worksheet identifier. */
async function syncSheet(session, localSheet, remoteSheetId, remoteName) {
	if (!localSheet) {
		return;
	}
	if (localSheet.name && localSheet.name !== remoteName) {
		await session.mutate(Requests.sheetRename, {
			name: localSheet.name,
			sheetId: remoteSheetId
		});
	}
	for (const [address, cell] of Object.entries(localSheet.cells || {})) {
		await syncCell(session, remoteSheetId, address, cell || {});
	}
}

/** Copies raw value, note, and supported style metadata through normal server permission gates. */
async function syncCell(session, sheetId, address, cell) {
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
	const style = supportedStyle(cell.style);
	if (Object.keys(style).length) {
		await session.mutate(Requests.rangeStyle, {
			addresses: [address],
			sheetId,
			style
		});
	}
}

/** Keeps draft synchronization inside the same first-release style vocabulary as the server. */
function supportedStyle(style = {}) {
	const result = {};
	if (typeof style.bold === "boolean") {
		result.bold = style.bold;
	}
	if (/^#[0-9a-f]{6}$/i.test(String(style.highlight || ""))) {
		result.highlight = style.highlight;
	}
	return result;
}
