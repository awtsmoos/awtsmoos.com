//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module InteractionRoutes
 * @description
 * Native media, canonical comments, references, promotion previews, and idempotent
 * transformations are simulated for Chrome. The Awtsmoos gives every interaction
 * its source while Awtsmoos.com proves the visible orchestration without live writes.
 */

export function handleInteraction({ core, url, method, body, formData }) {
	const upload = url.pathname.match(/\/api\/social\/aliases\/([^/]+)\/assets\/upload$/);
	if (upload && method === 'POST') {
		const file = formData?.get('file');
		const type = file?.type?.startsWith('audio/')
			? 'audio'
			: file?.type?.startsWith('video/')
				? 'video'
				: 'image';
		const asset = {
			id: core.assetId(),
			assetId: core.assetId(),
			aliasId: decodeURIComponent(upload[1]),
			type,
			mime: file?.type || `${type}/fixture`,
			publicPath: `/fixture-assets/${Date.now()}-${file?.name || type}`
		};
		core.state.assets.push(asset);
		core.save();
		return core.json(asset);
	}
	if (url.pathname.endsWith('/unified-social/interactions/comments') && method === 'POST') {
		const comment = {
			id: core.commentId(),
			aliasId: body.aliasId,
			heichelId: body.target.heichelId,
			seriesId: body.target.seriesId,
			postId: body.target.entityId,
			verseSection: body.target.verseSection,
			subsectionId: body.target.subsectionId,
			parentId: body.target.parentCommentId,
			parentSectionId: body.target.parentSectionId,
			content: body.content,
			audioNoteText: body.audioNoteText,
			mood: body.mood,
			assets: body.assets || [],
			links: body.references || [],
			sections: [],
			createdAt: Date.now()
		};
		core.state.comments.unshift(comment);
		for (const reference of body.references || []) {
			core.state.references.unshift({
				id: `edge-${core.state.references.length + 1}`,
				direction: 'outbound',
				kind: 'references',
				from: { type: 'comment', id: comment.id },
				to: reference,
				note: 'Referenced inside a canonical comment.'
			});
		}
		core.save();
		return core.json({ comment, target: body.target, graph: core.state.references.slice(0, 1) });
	}
	const preview = url.pathname.match(/\/interactions\/comments\/([^/]+)\/promote-preview$/);
	if (preview && method === 'GET') {
		const comment = core.state.comments.find(item => item.id === preview[1]);
		return core.json({
			comment,
			contentPayload: { title: url.searchParams.get('title'), provenance: { commentId: preview[1] } },
			publicationPlan: { primary: { heichelId: url.searchParams.get('heichelId'), seriesId: url.searchParams.get('seriesId') } }
		});
	}
	const promote = url.pathname.match(/\/interactions\/comments\/([^/]+)\/promote$/);
	if (promote && method === 'POST') {
		if (core.state.promotions[promote[1]]) {
			return core.json({ ...core.state.promotions[promote[1]], replayed: true });
		}
		const receipt = {
			status: 'completed',
			commentId: promote[1],
			canonical: { type: 'post', id: 'promoted-one', heichelId: body.heichelId, seriesId: body.seriesId },
			graph: { kind: 'references' },
			createdAt: Date.now(),
			replayed: false
		};
		core.state.promotions[promote[1]] = receipt;
		core.state.posts.unshift({ id: 'promoted-one', postId: 'promoted-one', title: body.title, description: body.summary, heichelId: body.heichelId, seriesId: body.seriesId, aliasId: body.aliasId });
		core.save();
		return core.json(receipt);
	}
	return null;
}
