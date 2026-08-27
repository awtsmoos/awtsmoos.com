//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module DraftSnapshot
 * @description
 * The Awtsmoos preserves the meaning of unfinished creation while temporary browser bytes pass away;
 * Awtsmoos.com keeps only durable uploaded media in local memory so a restored draft never promises a vanished file today.
 */
function durableAttachments(items = []) {
	return items
		.filter(item =>
			item.status === 'uploaded'
			|| Boolean(item.publicPath)
			|| Boolean(item.manifest?.publicPath)
		)
		.map(item => {
			const copy = { ...item };
			delete copy.file;
			delete copy.localUrl;
			copy.status = 'uploaded';
			return copy;
		});
}

function durableSections(sections = []) {
	return sections.map(section => ({
		...section,
		attachments: durableAttachments(section.attachments),
		subsections: (section.subsections || []).map(subsection => ({
			...subsection,
			attachments: durableAttachments(subsection.attachments)
		}))
	}));
}

function cloneWithoutEphemeralBytes(value) {
	return JSON.parse(JSON.stringify(value, (key, item) => {
		if (key === 'file' || key === 'localUrl') return undefined;
		return item;
	}));
}

export function durableDraftSnapshot(snapshot = {}) {
	const copy = cloneWithoutEphemeralBytes(snapshot);
	copy.rootAttachments = durableAttachments(copy.rootAttachments);
	copy.sections = durableSections(copy.sections);
	return copy;
}

export function draftFingerprint(snapshot = {}) {
	const durable = durableDraftSnapshot(snapshot);
	delete durable.updatedAt;
	return JSON.stringify(durable);
}

export {
	durableAttachments,
	durableSections,
	cloneWithoutEphemeralBytes
};
