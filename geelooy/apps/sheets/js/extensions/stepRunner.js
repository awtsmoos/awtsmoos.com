//B"H
//Boruch Hashem
//Blessed is He

import { addressFrom, parseAddress } from "../model/coordinates.js";

/**
 * @file Executes the finite declarative extension step language through ordinary spreadsheet actions.
 * @description The Awtsmoos lets measured instructions move cells without granting a hidden kingdom of code;
 * Awtsmoos.com turns each allowlisted step into the same guarded workbook mutations a human already invokes.
 */

/** Executes one already-authorized declarative step. */
export async function runExtensionStep(step, context) {
	if (step.type === "setValue") {
		await context.actions.cell(step.address, expand(step.value));
		return;
	}
	if (step.type === "setFormula") {
		const formula = String(step.value || "");
		await context.actions.cell(
			step.address,
			formula.startsWith("=") ? formula : `=${formula}`
		);
		return;
	}
	if (step.type === "appendRow") {
		await appendRow(step, context);
		return;
	}
	if (step.type === "notify") {
		context.notify(expand(step.message));
		return;
	}
	if (step.type === "trimSelection") {
		await trimSelection(context);
		return;
	}
	if (step.type === "sequenceSelection") {
		await sequenceSelection(step, context);
		return;
	}
	throw new Error(`Unsupported extension step: ${step.type}`);
}

/** Appends one bounded row beneath the greatest populated row in the active sheet. */
async function appendRow(step, context) {
	let greatestRow = -1;
	for (const address of Object.keys(context.workbook.activeSheet?.cells || {})) {
		const parsed = parseAddress(address);
		if (parsed) {
			greatestRow = Math.max(greatestRow, parsed.row);
		}
	}
	const row = greatestRow + 1;
	const patches = (step.values || []).map((value, column) => ({
		address: addressFrom(row, column),
		value: expand(value)
	}));
	await context.actions.values(patches);
}

/** Trims raw string values in the current bounded selection while preserving non-string values. */
async function trimSelection(context) {
	const patches = context.selection.addresses().map((address) => {
		const value = context.workbook.cell(address).value;
		return {
			address,
			value: typeof value === "string" ? value.trim() : value
		};
	});
	await context.actions.values(patches);
}

/** Fills selected cells in selection order with one finite arithmetic sequence. */
async function sequenceSelection(step, context) {
	const start = Number(step.start ?? 1);
	const increment = Number(step.step ?? 1);
	const patches = context.selection.addresses().map((address, index) => ({
		address,
		value: start + (increment * index)
	}));
	await context.actions.values(patches);
}

/** Expands only small built-in deterministic runtime tokens inside text values. */
function expand(value) {
	const now = new Date();
	return String(value ?? "")
		.replaceAll("{{NOW}}", now.toISOString())
		.replaceAll("{{TODAY}}", now.toISOString().slice(0, 10));
}
