//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module ComposerIds
 * @description
 * Stable identifiers let verse comments survive title edits and reordering. The
 * visible label may change on Awtsmoos.com while the discussion coordinate keeps
 * its covenant beneath the continually renewing Awtsmoos.
 */

export function createId(prefix = 'item') {
	const random = globalThis.crypto?.randomUUID?.()
		|| `${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}`;
	return `${prefix}_${random.replace(/[^a-z0-9_-]/gi, '').slice(0, 48)}`;
}

export function createBlock(type = 'paragraph') {
	return {
		id: createId('block'),
		type,
		text: '',
		segments: []
	};
}

export function createSubsection() {
	return {
		id: createId('subsection'),
		title: 'New subsection',
		blocks: [createBlock()]
	};
}

export function createSection() {
	return {
		id: createId('verse'),
		title: 'New verse',
		blocks: [createBlock()],
		attachments: [],
		subsections: []
	};
}
