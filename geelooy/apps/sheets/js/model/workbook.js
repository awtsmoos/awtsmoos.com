//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file Owns the sparse client-side workbook state.
 * @description Cells appear only when their content needs a vessel; the Awtsmoos renews
 * the empty grid and written grid alike, while Awtsmoos.com keeps state small and bright.
 */

/** Creates one local workbook that can later receive a server identity. */
export function createLocalWorkbook() {
	return {
		canEdit: true,
		canShare: false,
		id: "",
		revision: 0,
		title: "Untitled workbook",
		visibility: "private",
		sheets: [createSheet("Sheet 1")]
	};
}

/** Creates one sparse worksheet with a browser-local temporary id. */
export function createSheet(name) {
	return {
		id: `sheet-${crypto.randomUUID()}`,
		name: String(name || "Sheet").slice(0, 80),
		cells: {}
	};
}

/** Keeps workbook mutations explicit while UI modules observe one event source. */
export class MalchusWorkbook extends EventTarget {
	constructor(snapshot = createLocalWorkbook()) {
		super();
		this.load(snapshot);
	}

	/** Replaces current state from one normalized local or server snapshot. */
	load(snapshot) {
		this.data = structuredClone(snapshot || createLocalWorkbook());
		this.activeSheetId = this.data.sheets?.[0]?.id || "";
		this.changed("load");
	}

	/** Returns the currently active worksheet. */
	get activeSheet() {
		return this.data.sheets.find((sheet) => sheet.id === this.activeSheetId)
			|| this.data.sheets[0];
	}

	/** Changes the active worksheet without mutating workbook data. */
	activateSheet(sheetId) {
		if (this.data.sheets.some((sheet) => sheet.id === sheetId)) {
			this.activeSheetId = sheetId;
			this.changed("sheet.active");
		}
	}

	/** Returns one sparse cell record, never leaking the internal object for absence. */
	cell(address, sheetId = this.activeSheetId) {
		const sheet = this.data.sheets.find((item) => item.id === sheetId);
		return sheet?.cells?.[address] || { value: "", note: "", style: {} };
	}

	/** Applies one cell field patch while preserving other metadata. */
	patchCell(sheetId, address, patch, revision = null) {
		const sheet = this.data.sheets.find((item) => item.id === sheetId);
		if (!sheet) {
			return;
		}
		const current = sheet.cells[address] || { value: "", note: "", style: {} };
		sheet.cells[address] = {
			...current,
			...patch,
			style: { ...(current.style || {}), ...(patch.style || {}) }
		};
		if (Number.isSafeInteger(revision)) {
			this.data.revision = revision;
		}
		this.changed("cell.patch");
	}

	/** Adds one worksheet and activates it only when the caller owns that local intent. */
	addSheet(sheet, activate = true) {
		if (!this.data.sheets.some((item) => item.id === sheet.id)) {
			this.data.sheets.push(structuredClone(sheet));
		}
		if (activate) {
			this.activeSheetId = sheet.id;
		}
		this.changed("sheet.add");
	}

	/** Renames one worksheet in place. */
	renameSheet(sheetId, name) {
		const sheet = this.data.sheets.find((item) => item.id === sheetId);
		if (sheet) {
			sheet.name = String(name || "Sheet").slice(0, 80);
			this.changed("sheet.rename");
		}
	}

	/** Emits one reasoned change event for renderers and draft persistence. */
	changed(reason) {
		this.dispatchEvent(new CustomEvent("change", { detail: { reason } }));
	}
}
