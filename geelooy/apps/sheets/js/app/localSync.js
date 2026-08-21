//B"H
//Boruch Hashem
//Blessed is He

import { Requests } from "../realtime/protocol.js";
import { syncLocalCell } from "./localSyncCell.js";
import { syncWorkbookExtensions } from "./localSyncExtensions.js";
import { syncSheetGeometry } from "./localSyncGeometry.js";

/**
 * @file Materializes a browser-local workbook into shared Awtsmoos truth without downgrading its modern state.
 * @description The Awtsmoos lets private letters, dimensions, garments, tabs, and safe automations cross together in light;
 * Awtsmoos.com composes small preservation vessels so one-click sharing never trades convenience for lost workbook sight.
 */
export async function materializeLocalWorkbook(session, workbook) {
	if (workbook.data.id) {
		return workbook.data;
	}
	const localSnapshot = structuredClone(workbook.data);
	await session.create(localSnapshot.title || "Untitled workbook");
	await syncFirstSheet(
		session,
		workbook,
		localSnapshot.sheets?.[0]
	);
	for (const localSheet of (localSnapshot.sheets || []).slice(1)) {
		await createAndSyncSheet(session, localSheet);
	}
	await syncWorkbookExtensions(
		session,
		localSnapshot.extensions
	);
	return workbook.data;
}

/** Maps the original first local tab onto the server-created first tab. */
async function syncFirstSheet(session, workbook, localSheet) {
	if (!localSheet) {
		return;
	}
	const remoteSheet = workbook.data.sheets?.[0];
	if (!remoteSheet?.id) {
		throw new Error("Shared workbook did not provide its first sheet.");
	}
	await syncSheet(
		session,
		localSheet,
		remoteSheet.id,
		remoteSheet.name
	);
}

/** Creates one additional remote tab and fills it from its local predecessor. */
async function createAndSyncSheet(session, localSheet) {
	const response = await session.mutate(
		Requests.sheetAdd,
		{ name: localSheet.name || "Sheet" }
	);
	const remoteSheet = response.operation?.sheet;
	if (!remoteSheet?.id) {
		throw new Error("Shared workbook did not return the new sheet.");
	}
	await syncSheet(
		session,
		localSheet,
		remoteSheet.id,
		remoteSheet.name
	);
}

/** Replays one tab's name, sparse cells, notes, full style vocabulary, and custom dimensions. */
async function syncSheet(session, localSheet, remoteSheetId, remoteName) {
	if (localSheet.name && localSheet.name !== remoteName) {
		await session.mutate(Requests.sheetRename, {
			name: localSheet.name,
			sheetId: remoteSheetId
		});
	}
	for (const [address, cell] of Object.entries(localSheet.cells || {})) {
		await syncLocalCell(
			session,
			remoteSheetId,
			address,
			cell || {}
		);
	}
	await syncSheetGeometry(
		session,
		localSheet,
		remoteSheetId
	);
}
