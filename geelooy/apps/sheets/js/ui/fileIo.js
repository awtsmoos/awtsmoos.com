//B"H
//Boruch Hashem
//Blessed is He

import {
	matrixToCells,
	parseCsv,
	sheetToCsv
} from "../model/csv.js";
import { applyValuePatches } from "../app/bulkValues.js";

/**
 * @file Bridges browser file pickers and downloads with Awtsmoos Sheets workbook state.
 * @description The Awtsmoos lets an old table enter and a renewed table depart through measured gates;
 * Awtsmoos.com keeps file interchange familiar while collaborative state remains the source that waits.
 */
export class HodFileIo {
	constructor(workbook, actions, onError) {
		this.workbook = workbook;
		this.actions = actions;
		this.onError = onError;
		this.fileInput = document.getElementById("fileInput");
		this.fileInput.addEventListener("change", () => this.importSelected());
	}

	/** Opens the browser picker without coupling toolbar code to file APIs. */
	chooseFile() {
		this.fileInput.value = "";
		this.fileInput.click();
	}

	/** Reads one CSV/TSV file and applies its values through bounded collaborative batches. */
	async importSelected() {
		const file = this.fileInput.files?.[0];
		if (!file) {
			return;
		}
		try {
			const text = await file.text();
			const rows = isTsv(file)
				? parseTsv(text)
				: parseCsv(text);
			const cells = matrixToCells(rows, 1000, 26);
			const patches = Object.entries(cells).map(([address, cell]) => ({
				address,
				value: String(cell.value ?? "")
			}));
			await applyValuePatches(this.actions, patches);
		} catch (error) {
			this.onError?.(error);
		}
	}

	/** Downloads the active worksheet as familiar CSV without mutating workbook state. */
	exportActiveSheet() {
		const csv = sheetToCsv(this.workbook.activeSheet);
		const blob = new Blob([csv], {
			type: "text/csv;charset=utf-8"
		});
		const url = URL.createObjectURL(blob);
		const anchor = document.createElement("a");
		anchor.href = url;
		anchor.download = `${safeFileName(this.workbook.activeSheet?.name || "Sheet")}.csv`;
		document.body.append(anchor);
		anchor.click();
		anchor.remove();
		setTimeout(() => URL.revokeObjectURL(url), 0);
	}
}

/** Recognizes tab-separated files by extension or MIME type. */
function isTsv(file) {
	return String(file.name || "").toLowerCase().endsWith(".tsv")
		|| file.type === "text/tab-separated-values";
}

/** Parses a deliberately simple TSV interchange matrix. */
function parseTsv(text) {
	return String(text || "")
		.replaceAll("\r\n", "\n")
		.replaceAll("\r", "\n")
		.split("\n")
		.map((row) => row.split("\t"));
}

/** Produces a portable filename from a human worksheet label. */
function safeFileName(value) {
	return String(value || "Sheet")
		.replace(/[\\/:*?"<>|]+/g, "-")
		.trim()
		.slice(0, 80) || "Sheet";
}
