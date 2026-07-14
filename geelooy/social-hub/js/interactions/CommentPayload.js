//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module CommentPayload
 * @description
 * Visible target fields, text, transcript, media manifests, and one optional
 * canonical reference become the exact interaction request. The Awtsmoos joins
 * every response to its source while Awtsmoos.com excludes pending local blobs.
 */

function value(root, id) {
	return String(root.getElementById(id)?.value || '').trim();
}

function targetFromFields(root) {
	return {
		heichelId: value(root, 'commentHeichelId'),
		seriesId: value(root, 'commentSeriesId') || 'root',
		entityType: value(root, 'commentEntityType') || 'post',
		entityId: value(root, 'commentEntityId'),
		verseSection: value(root, 'commentVerseSection') || 'root',
		subsectionId: value(root, 'commentSubsectionId'),
		parentCommentId: value(root, 'commentParentId'),
		parentSectionId: value(root, 'commentParentSectionId')
	};
}

function uploadedAssets(items = []) {
	return items
		.filter(item => item.status === 'uploaded' && item.id)
		.map(item => ({
			id: item.id,
			type: item.type,
			mime: item.mime,
			publicPath: item.publicPath,
			alt: item.alt || '',
			caption: item.caption || '',
			role: item.type === 'audio'
				? 'voice-note'
				: item.type === 'video'
					? 'video-report'
					: 'inline'
		}));
}

function referenceFromFields(root) {
	const id = value(root, 'referenceEntityId');
	const heichelId = value(root, 'referenceHeichelId');
	if (!id || !heichelId) return [];
	return [{
		kind: value(root, 'referenceKind') || 'post',
		type: value(root, 'referenceEntityType') || 'post',
		id,
		heichelId,
		seriesId: value(root, 'referenceSeriesId') || 'root',
		sectionId: value(root, 'referenceSectionId'),
		label: value(root, 'referenceLabel')
	}];
}

function commentPayload(root, snapshot) {
	return {
		aliasId: snapshot.identity.aliasId,
		target: targetFromFields(root),
		content: value(root, 'commentContent'),
		audioNoteText: value(root, 'commentTranscript'),
		mood: value(root, 'commentMood'),
		assets: uploadedAssets(snapshot.comment.assets),
		references: referenceFromFields(root)
	};
}

function pendingMedia(items = []) {
	return items.filter(item => item.status !== 'uploaded');
}

export {
	value,
	targetFromFields,
	uploadedAssets,
	referenceFromFields,
	commentPayload,
	pendingMedia
};
