// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module BookSourceCommon
 * @description Canonical social paths keep request-bound and worker book readers in one truth.
 */
function segment(value) {
	return encodeURIComponent(String(value ?? ''));
}

function unwrap(value) {
	if (value && typeof value === 'object' && 'success' in value) return value.success;
	return value;
}

function idList(value) {
	const rows = unwrap(value);
	if (!Array.isArray(rows)) return [];
	return rows.map(row => {
		if (typeof row === 'string') return row;
		return row?.id || row?.postId || row?.seriesId || '';
	}).filter(Boolean).map(String);
}

function paths(heichelId, seriesId, postId = '') {
	const root = `/api/social/heichelos/${segment(heichelId)}/series/${segment(seriesId)}`;
	return {
		series: root,
		children: `${root}/subSeries`,
		posts: `${root}/posts`,
		post: `${root}/post/${segment(postId)}`,
		translations: `${root}/post/${segment(postId)}/translations`
	};
}

function sourceApi(request) {
	return {
		async series(heichelId, seriesId) {
			return unwrap(await request(paths(heichelId, seriesId).series));
		},
		async children(heichelId, seriesId) {
			return idList(await request(paths(heichelId, seriesId).children));
		},
		async postIds(heichelId, seriesId) {
			return idList(await request(paths(heichelId, seriesId).posts));
		},
		async post(heichelId, seriesId, postId) {
			return unwrap(await request(paths(heichelId, seriesId, postId).post));
		},
		async translations(heichelId, seriesId, postId) {
			return idOrRows(await request(paths(heichelId, seriesId, postId).translations));
		}
	};
}

function idOrRows(value) {
	const rows = unwrap(value);
	return Array.isArray(rows) ? rows : [];
}

module.exports = {
	idList,
	paths,
	segment,
	sourceApi,
	unwrap
};
