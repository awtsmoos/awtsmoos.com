//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module ComposerMetrics
 * @description
 * Word, verse, and media counts are derived from the same nested document state.
 * The Awtsmoos knows every letter and image without counting; Awtsmoos.com counts
 * transparently so the writer sees scale without creating another source of truth.
 */

function allBlocks(snapshot) {
	return [
		...snapshot.rootBlocks,
		...snapshot.sections.flatMap(section => [
			...section.blocks,
			...section.subsections.flatMap(subsection => subsection.blocks)
		])
	];
}

function wordCount(snapshot) {
	return allBlocks(snapshot)
		.flatMap(block => String(block.text || '').trim().split(/\s+/))
		.filter(Boolean).length;
}

function mediaCount(snapshot) {
	return snapshot.rootAttachments.length
		+ snapshot.sections.reduce((total, section) => {
			return total
				+ section.attachments.length
				+ section.subsections.reduce((sum, item) => {
					return sum + (item.attachments?.length || 0);
				}, 0);
		}, 0);
}

function renderMetrics(root, snapshot) {
	root.getElementById('wordCount').textContent = String(wordCount(snapshot));
	root.getElementById('sectionCount').textContent = String(snapshot.sections.length);
	root.getElementById('mediaCount').textContent = String(mediaCount(snapshot));
	root.getElementById('destinationCount').textContent = String(
		(snapshot.identity.heichelId ? 1 : 0) + snapshot.secondaryDestinations.length
	);
}

export {
	allBlocks,
	wordCount,
	mediaCount,
	renderMetrics
};
