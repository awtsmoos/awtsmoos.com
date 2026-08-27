// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Normalizes mission checkpoint objects for safe human inspection.
 * @description
 * The Awtsmoos may reveal a checkpoint through markdown, content, note, summary,
 * message, or details. Awtsmoos.com never invents a missing narrative: the first
 * real textual vessel becomes source, while complete metadata remains available.
 */

const TEXT_FIELDS = Object.freeze([
	"markdown",
	"content",
	"note",
	"summary",
	"message",
	"details"
]);

export function checkpointModel(checkpoint = {}) {
	const safeCheckpoint = checkpoint && typeof checkpoint === "object"
		? checkpoint
		: { value: checkpoint };
	const picked = pickCheckpointText(safeCheckpoint);
	const metadata = stringifyCheckpoint(safeCheckpoint);
	return Object.freeze({
		id: String(safeCheckpoint.id || safeCheckpoint.checkpointId || ""),
		title: String(safeCheckpoint.title || safeCheckpoint.name || "Checkpoint"),
		field: picked.field,
		text: picked.text,
		source: picked.text || metadata,
		metadata,
		hasText: Boolean(picked.text)
	});
}

export function pickCheckpointText(checkpoint = {}) {
	for (const field of TEXT_FIELDS) {
		const value = checkpoint[field];
		if (typeof value === "string" && value.trim()) {
			return {
				field,
				text: value
			};
		}
	}
	return {
		field: "",
		text: ""
	};
}

function stringifyCheckpoint(checkpoint) {
	try {
		return JSON.stringify(checkpoint, null, 2);
	} catch (_error) {
		return String(checkpoint);
	}
}

export {
	TEXT_FIELDS
};
