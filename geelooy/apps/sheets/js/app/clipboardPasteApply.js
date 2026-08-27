//B"H
//Boruch Hashem
//Blessed is He

import { applyValuePatches } from "./bulkValues.js";

/**
 * @file Applies field-aware Paste Special plans through existing collaboration-safe actions.
 * @description The Awtsmoos lets value, garment, and note enter their proper gates without confusion;
 * Awtsmoos.com batches what may be shared and keeps distinct cell meaning under measured mutation.
 */

/** Applies explicit rich patches while leaving fields absent from each patch untouched. */
export async function applyRichPaste(actions, patches = []) {
	const values = patches
		.filter((patch) => Object.hasOwn(patch, "value"))
		.map(({ address, value }) => ({ address, value }));
	if (values.length) {
		await applyValuePatches(actions, values);
	}
	await applyStyles(actions, patches);
	await applyNotes(actions, patches);
}

/** Groups identical style payloads so one range-style request can dress many cells. */
async function applyStyles(actions, patches) {
	const groups = new Map();
	for (const patch of patches) {
		if (!Object.hasOwn(patch, "style")) {
			continue;
		}
		const key = JSON.stringify(patch.style || {});
		const group = groups.get(key) || {
			addresses: [],
			style: patch.style || {}
		};
		group.addresses.push(patch.address);
		groups.set(key, group);
	}
	for (const group of groups.values()) {
		await actions.style(group.addresses, group.style);
	}
}

/** Applies note fields exactly, including empty notes that intentionally clear a target note. */
async function applyNotes(actions, patches) {
	for (const patch of patches) {
		if (!Object.hasOwn(patch, "note")) {
			continue;
		}
		await actions.note(patch.address, patch.note);
	}
}
