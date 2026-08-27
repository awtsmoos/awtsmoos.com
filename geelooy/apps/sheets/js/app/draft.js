//B"H
//Boruch Hashem
//Blessed is He

import { createLocalWorkbook } from "../model/workbook.js";

/**
 * @file Preserves a browser-local workbook breadcrumb across refreshes and connection loss.
 * @description The Awtsmoos renews every instant while memory keeps a humble trace of what was seen;
 * Awtsmoos.com stores only workbook draft data here, never credentials or hidden identity between.
 */
const DRAFT_KEY = "awtsmoos.sheets.local-draft.v1";

/** Returns the last parseable local draft or one fresh sparse workbook. */
export function loadLocalDraft() {
	try {
		const parsed = JSON.parse(localStorage.getItem(DRAFT_KEY) || "null");
		if (parsed?.sheets?.length) {
			return parsed;
		}
	} catch {
		localStorage.removeItem(DRAFT_KEY);
	}
	return createLocalWorkbook();
}

/** Stores only serializable workbook data and silently tolerates private-storage denial. */
export function saveLocalDraft(workbookData) {
	try {
		localStorage.setItem(DRAFT_KEY, JSON.stringify(workbookData));
	} catch {
		// A storage-denying browser may still use the live in-memory workbook.
	}
}

/** Removes the local breadcrumb when the user explicitly starts a clean workbook. */
export function clearLocalDraft() {
	try {
		localStorage.removeItem(DRAFT_KEY);
	} catch {
		// Storage may be unavailable; the in-memory reset remains authoritative.
	}
}
