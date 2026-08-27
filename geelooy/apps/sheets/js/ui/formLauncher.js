//B"H
//Boruch Hashem
//Blessed is He

import { writeWorkbookAddress } from "../app/connectionAddress.js";
import { materializeLocalWorkbook } from "../app/localSync.js";
import { showToast } from "./toast.js";

/**
 * @file Launches a Forms creator from the active Sheet, safely materializing local drafts when needed.
 * @description The Awtsmoos lets one spreadsheet tab become the hidden root of a public question vessel in light;
 * Awtsmoos.com preserves every local letter before revealing the linked Forms doorway, so convenience never costs truth.
 */
export class NetzachFormLauncher {
	constructor(context) {
		this.workbook = context.workbook;
		this.session = context.session;
		this.showError = context.showError;
		this.launching = false;
	}

	/** Binds the existing Extensions→Forms command event to one guarded launch flow. */
	bind() {
		document.addEventListener("sheets:create-form", () => {
			this.launch().catch((error) => this.showError?.(error));
		});
	}

	/** Materializes local state when necessary, preserves the active tab, and opens the linked creator. */
	async launch() {
		if (this.launching) {
			return;
		}
		if (!this.workbook.data.canEdit) {
			throw new Error("Create a linked form requires edit access to this workbook.");
		}
		this.launching = true;
		const targetWindow = openLaunchWindow();
		try {
			await this.ensureSharedWorkbook();
			const url = linkedFormUrl(
				this.workbook.data.id,
				this.workbook.activeSheetId
			);
			navigateLaunchTarget(targetWindow, url);
			showToast("Linked form creator opened.");
		} catch (error) {
			targetWindow?.close();
			throw error;
		} finally {
			this.launching = false;
		}
	}

	/** Saves an unsaved draft through the canonical sync path while preserving its active sheet by index. */
	async ensureSharedWorkbook() {
		if (this.workbook.data.id) {
			return;
		}
		const activeIndex = Math.max(
			0,
			this.workbook.data.sheets.findIndex(
				(sheet) => sheet.id === this.workbook.activeSheetId
			)
		);
		showToast("Saving workbook before linking form…");
		await materializeLocalWorkbook(this.session, this.workbook);
		writeWorkbookAddress(this.workbook.data.id);
		const remoteSheet = this.workbook.data.sheets[activeIndex]
			|| this.workbook.data.sheets[0];
		if (remoteSheet?.id) {
			this.workbook.activateSheet(remoteSheet.id);
		}
	}
}

/** Opens a user-gesture window before async materialization so browsers do not block the eventual creator. */
function openLaunchWindow() {
	const target = window.open("about:blank", "_blank");
	if (target) {
		target.opener = null;
	}
	return target;
}

/** Builds the only linkage data the Forms creator receives from Sheets. */
function linkedFormUrl(workbookId, sheetId) {
	const url = new URL("/apps/forms/", location.origin);
	url.searchParams.set("workbook", workbookId);
	url.searchParams.set("sheet", sheetId);
	return url.toString();
}

/** Navigates the reserved new tab or falls back to the current tab when popups are blocked. */
function navigateLaunchTarget(targetWindow, url) {
	if (targetWindow && !targetWindow.closed) {
		targetWindow.location.href = url;
		return;
	}
	location.href = url;
}
