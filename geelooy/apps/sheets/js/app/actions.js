//B"H
//Boruch Hashem
//Blessed is He

import { createSheet } from "../model/workbook.js";
import { Requests } from "../realtime/protocol.js";
import {
	applyRangeStyle,
	applyRangeValues
} from "./rangeMutations.js";
import { GevurahStructureActions } from "./structureActions.js";

/**
 * @file Gives UI controllers one capability-aware command surface for workbook and structural mutations.
 * @description The Awtsmoos joins local draft and shared document without mixing their gate;
 * Awtsmoos.com lets dimension, value, and style inherit beside one another in ordered state.
 */
export class GevurahWorkbookActions extends GevurahStructureActions {
	/** Commits one raw value locally or through the authoritative shared workbook. */
	async cell(address, value) {
		if (!this.workbook.data.id) {
			this.workbook.patchCell(
				this.workbook.activeSheetId,
				address,
				{ value }
			);
			return;
		}
		await this.session.mutate(Requests.cellUpdate, {
			address,
			sheetId: this.workbook.activeSheetId,
			value
		});
	}

	/** Commits every value patch locally or through server-safe collaborative batches. */
	async values(patches) {
		return await applyRangeValues(
			this.workbook,
			this.session,
			patches
		);
	}

	/** Stores one note separately from cell text. */
	async note(address, note) {
		if (!this.workbook.data.id) {
			this.workbook.patchCell(
				this.workbook.activeSheetId,
				address,
				{ note }
			);
			return;
		}
		await this.session.mutate(Requests.noteSet, {
			address,
			note,
			sheetId: this.workbook.activeSheetId
		});
	}

	/** Applies one supported style patch to every requested address without clipping the range. */
	async style(addresses, style) {
		return await applyRangeStyle(
			this.workbook,
			this.session,
			addresses,
			style
		);
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
		await this.session.mutate(
			Requests.sheetRename,
			{ name, sheetId }
		);
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
		return await this.session.share(
			Requests.shareUpdate,
			{ visibility }
		);
	}

	/** Adds one verified account identifier to the durable editor ACL. */
	async invite(editorId) {
		return await this.session.share(
			Requests.shareInvite,
			{ editorId }
		);
	}
}
