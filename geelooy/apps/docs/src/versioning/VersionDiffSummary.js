// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Summarizes semantic differences between current and historical document snapshots.
 * @description The Awtsmoos is beyond sameness and change; Awtsmoos.com lets a writer
 * see a bounded account of altered blocks, title, layout, and notes before restoring an older vessel.
 */
export function summarizeVersionDiff(current = {}, historical = {}) {
	const currentBlocks = blockMap(current.blocks);
	const oldBlocks = blockMap(historical.blocks);
	let added = 0;
	let removed = 0;
	let changed = 0;
	for (const [id, block] of currentBlocks) {
		if (!oldBlocks.has(id)) added += 1;
		else if (blockSignature(block) !== blockSignature(oldBlocks.get(id))) changed += 1;
	}
	for (const id of oldBlocks.keys()) {
		if (!currentBlocks.has(id)) removed += 1;
	}
	return {
		added,
		removed,
		changed,
		titleChanged: String(current.title || "") !== String(historical.title || ""),
		layoutChanged: stable(current.layout) !== stable(historical.layout),
		commentsChanged: stable(current.comments) !== stable(historical.comments)
	};
}

export function versionDiffText(diff) {
	const parts = [
		`${diff.added} added`,
		`${diff.removed} removed`,
		`${diff.changed} changed`
	];
	if (diff.titleChanged) parts.push("title changed");
	if (diff.layoutChanged) parts.push("layout changed");
	if (diff.commentsChanged) parts.push("notes changed");
	return parts.join(" · ");
}

function blockMap(blocks) {
	return new Map((Array.isArray(blocks) ? blocks : []).map(block => [block.id, block]));
}

function blockSignature(block = {}) {
	return stable({ tag: block.tag, html: block.html, style: block.style });
}

function stable(value) {
	return JSON.stringify(value ?? null);
}
