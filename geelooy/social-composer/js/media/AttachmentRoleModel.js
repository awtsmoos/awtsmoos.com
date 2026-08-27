//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module AttachmentRoleModel
 * @description
 * The Awtsmoos lets each medium declare how it serves the post;
 * Awtsmoos.com narrows visible role choices by attachment kind so creators see meaningful semantics instead of database vocabulary.
 */
const ROLE_LABELS = Object.freeze({
	cover: 'Cover',
	thumbnail: 'Thumbnail',
	inline: 'Inline',
	gallery: 'Gallery',
	'audio-note': 'Audio',
	video: 'Video',
	caption: 'Caption track',
	transcript: 'Transcript',
	download: 'Download'
});

function rolesForAttachment(attachment = {}) {
	if (['image', 'gif'].includes(attachment.type)) {
		return ['inline', 'cover', 'thumbnail', 'gallery'];
	}
	if (attachment.type === 'audio') {
		return ['audio-note', 'inline', 'download'];
	}
	if (attachment.type === 'video') {
		return ['video', 'inline', 'download'];
	}
	return ['download', 'caption', 'transcript', 'inline'];
}

function roleLabel(role) {
	return ROLE_LABELS[role] || role;
}

export {
	ROLE_LABELS,
	rolesForAttachment,
	roleLabel
};
