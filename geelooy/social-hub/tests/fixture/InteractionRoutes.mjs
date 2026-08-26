//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module InteractionRoutes
 * @description
 * Native media, canonical comments, references, promotion previews, and idempotent transformations are simulated for Chrome;
 * the Awtsmoos gives each local contract one truthful fixture while Awtsmoos.com leaves external Archive.org video to its own injected proof.
 */
export function handleInteraction({ core, url, method, body, formData }) {
	const yesodUpload = url.pathname.match(/\/api\/social\/assets\/([^/]+)\/upload$/);
	if (yesodUpload && method === 'POST') {
		const malchusFile = formData?.get('file');
		const nefeshType = malchusFile?.type?.startsWith('audio/') ? 'audio' : 'image';
		const malchusAsset = {
			id: core.assetId(),
			assetId: core.assetId(),
			aliasId: decodeURIComponent(yesodUpload[1]),
			type: nefeshType,
			mime: malchusFile?.type || `${nefeshType}/fixture`,
			publicPath: `/fixture-assets/${Date.now()}-${malchusFile?.name || nefeshType}`
		};
		core.state.assets.push(malchusAsset);
		core.save();
		return core.json(malchusAsset);
	}
	if (url.pathname.endsWith('/unified-social/interactions/comments') && method === 'POST') {
		const malchusComment = {
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
		core.state.comments.unshift(malchusComment);
		for (const binahReference of body.references || []) {
			core.state.references.unshift({
				id: `edge-${core.state.references.length + 1}`,
				direction: 'outbound',
				kind: 'references',
				from: { type: 'comment', id: malchusComment.id },
				to: binahReference,
				note: 'Referenced inside a canonical comment.'
			});
		}
		core.save();
		return core.json({ comment: malchusComment, target: body.target, graph: core.state.references.slice(0, 1) });
	}
	const binahPreview = url.pathname.match(/\/interactions\/comments\/([^/]+)\/promote-preview$/);
	if (binahPreview && method === 'GET') {
		const yesodComment = core.state.comments.find(item => item.id === binahPreview[1]);
		return core.json({
			comment: yesodComment,
			contentPayload: { title: url.searchParams.get('title'), provenance: { commentId: binahPreview[1] } },
			publicationPlan: { primary: { heichelId: url.searchParams.get('heichelId'), seriesId: url.searchParams.get('seriesId') } }
		});
	}
	const gevurahPromotion = url.pathname.match(/\/interactions\/comments\/([^/]+)\/promote$/);
	if (gevurahPromotion && method === 'POST') {
		if (core.state.promotions[gevurahPromotion[1]]) {
			return core.json({ ...core.state.promotions[gevurahPromotion[1]], replayed: true });
		}
		const keterReceipt = {
			status: 'completed',
			commentId: gevurahPromotion[1],
			canonical: { type: 'post', id: 'promoted-one', heichelId: body.heichelId, seriesId: body.seriesId },
			graph: { kind: 'references' },
			createdAt: Date.now(),
			replayed: false
		};
		core.state.promotions[gevurahPromotion[1]] = keterReceipt;
		core.state.posts.unshift({ id: 'promoted-one', postId: 'promoted-one', title: body.title, description: body.summary, heichelId: body.heichelId, seriesId: body.seriesId, aliasId: body.aliasId });
		core.save();
		return core.json(keterReceipt);
	}
	return null;
}
