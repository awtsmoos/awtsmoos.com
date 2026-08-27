//B"H
//Boruch Hashem
//Blessed is He

import { createSheet } from "../model/workbook.js";
import { Requests } from "../realtime/protocol.js";

/**
 * @file Gives UI controllers one capability-aware command surface for workbook mutations.
 * @description The Awtsmoos joins local draft and shared document without mixing their gate;
 * Awtsmoos.com sends durable work through realtime while local work remains useful in its state.
 */
export class GevurahWorkbookActions {
	constructor(workbook, session) {
		this.workbook = workbook;
		this.session = session;
	}

	/** Commits one raw value locally or through the authoritative shared workbook. */
	async cell(address, value) {
		if (!this.workbook.data.id) {
			this.workbook.patchCell(this.workbook.activeSheetId, address, { value });
			return;
		}
		await this.session.mutate(Requests.cellUpdate, {
			address,
			sheetId: this.workbook.activeSheetId,
			value
		});
	}

	/** Commits a bounded group of value patches as one collaborative revision. */
	async values(patches) {
		if (!Array.isArray(patches) || !patches.length) {
			return;
		}
		if (!this.workbook.data.id) {
			for (const patch of patches) {
				this.workbook.patchCell(
					this.workbook.activeSheetId,
					patch.address,
					{ value: patch.value }
				);
			}
			return;
		}
		await this.session.mutate(Requests.rangeValues, {
			patches: patches.slice(0, 500),
			sheetId: this.workbook.activeSheetId
		});
	}

	/** Stores one note separately from cell text. */
	async note(address, note) {
		if (!this.workbook.data.id) {
			this.workbook.patchCell(this.workbook.activeSheetId, address, { note });
			return;
		}
		await this.session.mutate(Requests.noteSet, {
			address,
			note,
			sheetId: this.workbook.activeSheetId
		});
	}

	/** Applies one supported style patch across the selected address list. */
	async style(addresses, style) {
		if (!this.workbook.data.id) {
			for (const address of addresses) {
				this.workbook.patchCell(this.workbook.activeSheetId, address, { style });
			}
			return;
		}
		await this.session.mutate(Requests.rangeStyle, {
			addresses,
			sheetId: this.workbook.activeSheetId,
			style
		});
	}

	/** Adds a local or server-identified worksheet. */
	async addSheet() {
		const name = `Sheet ${this.workbook.data.sheets.length + 1}`;
		if (!this.workbook.data.id) {
			this.workbook.addSheet(createSheet(name));
			return;
		}
		await this.session.mutate(Requests.sheetAdd, { name });
	}

	/** Renames one worksheet without changing its stable identity. */
	async renameSheet(sheetId, name) {
		if (!this.workbook.data.id) {
			this.workbook.renameSheet(sheetId, name);
			return;
		}
		await this.session.mutate(Requests.sheetRename, { name, sheetId });
	}

	/** Renames the workbook locally or durably according to its current materialization. */
	async title(title) {
		if (!this.workbook.data.id) {
			this.workbook.data.title = title;
			this.workbook.changed("title.local");
			return;
		}
		await this.session.mutate(Requests.titleUpdate, { title });
	}

	/** Changes owner-only workbook visibility. */
	async visibility(visibility) {
		return await this.session.share(Requests.shareUpdate, { visibility });
	}

	/** Adds one verified account identifier to the durable editor ACL. */
	async invite(editorId) {
		return await this.session.share(Requests.shareInvite, { editorId });
	}
}
