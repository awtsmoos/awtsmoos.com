// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module RichCommentSchemaPrimitives
 * @description Small normalization primitives for dedicated rich comments.
 */

function text(value, max = 2000) {
	return String(value ?? '').replace(/[<>]/g, '').trim().slice(0, max);
}

function array(value) {
	if (Array.isArray(value)) return value;
	try {
		return JSON.parse(value || '[]');
	} catch {
		return [];
	}
}

function first(value, fallback) {
	return value === undefined || value === null || value === '' ? fallback : value;
}

function cleanAsset(asset) {
	if (!asset) return null;
	const item = typeof asset === 'string' ? { id: asset } : asset;
	return {
		id: text(item.id || item.assetId, 140),
		type: text(item.type || item.kind || '', 24),
		mime: text(item.mime || '', 80),
		publicPath: text(item.publicPath || item.url || '', 500),
		alt: text(item.alt || item.title || '', 180),
		role: text(item.role || '', 40)
	};
}

function cleanLink(link) {
	if (!link) return null;
	const item = typeof link === 'string' ? { url: link } : link;
	return {
		kind: text(item.kind || (item.commentId ? 'comment' : item.postId ? 'post' : 'url'), 32),
		url: text(item.url || '', 700),
		heichelId: text(item.heichelId || '', 100),
		seriesId: text(item.seriesId || '', 100),
		postId: text(item.postId || '', 100),
		commentId: text(item.commentId || '', 140),
		sectionId: text(item.sectionId || '', 100),
		label: text(item.label || item.title || '', 180)
	};
}

function previewForLink(link) {
	if (link.commentId) {
		return {
			kind: 'comment',
			title: link.label || `Comment ${link.commentId}`,
			href: link.url || `/comment/${link.commentId}${link.sectionId ? `#${link.sectionId}` : ''}`
		};
	}
	if (link.postId) {
		return {
			kind: 'post',
			title: link.label || `Post ${link.postId}`,
			href: link.url || `/post/${link.postId}`
		};
	}
	return {
		kind: 'url',
		title: link.label || link.url,
		href: link.url
	};
}

module.exports = {
	array,
	cleanAsset,
	cleanLink,
	first,
	previewForLink,
	text
};
