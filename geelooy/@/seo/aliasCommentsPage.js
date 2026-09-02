// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file aliasCommentsPage.js
 * @description
 * The Awtsmoos lets an alias's public discussion deeds unfold page by page instead of vanishing inside an infinite client scroll;
 * Awtsmoos.com gives every comment a normal canonical anchor, while pagination keeps the vessel bounded and whole.
 */

const { escapeHtml, encodeSegment } = require('../../seo/html.js');
const { loadAliasData } = require('./aliasData.js');

const PAGE_SIZE = 100;

function pageNumber(value) {
	const parsed = Number.parseInt(value, 10);
	return Number.isFinite(parsed) ? Math.max(1, parsed) : 1;
}

function navigation(aliasId, page, pageCount) {
	const base = `/@/${encodeSegment(aliasId)}/comments/`;
	const previous = page > 1 ? `<a rel="prev" href="${base}${page - 1}">Previous comments</a>` : '';
	const next = page < pageCount ? `<a rel="next" href="${base}${page + 1}">Next comments</a>` : '';
	return `<nav aria-label="Comment pages">${previous} ${next}</nav>`;
}

/** @description Renders a bounded crawlable page of canonical native comment links for one real alias. */
async function renderAliasCommentsPage($i, aliasId, rawPage) {
	const data = await loadAliasData($i, aliasId);
	if (!data) {
		return { statusCode: 404, mimeType: 'text/html; charset=utf-8', response: '<!DOCTYPE html><html><head><meta name="robots" content="noindex,follow"><title>Alias comments unavailable | Awtsmoos</title></head><body><h1>Alias comments unavailable</h1></body></html>' };
	}
	const page = pageNumber(rawPage);
	const pageCount = Math.max(1, Math.ceil(data.commentUrls.length / PAGE_SIZE));
	if (page > pageCount) {
		return { statusCode: 404, mimeType: 'text/html; charset=utf-8', response: '<!DOCTYPE html><html><head><meta name="robots" content="noindex,follow"><title>Comment page unavailable | Awtsmoos</title></head><body><h1>Comment page unavailable</h1></body></html>' };
	}
	const selected = data.commentUrls.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
	const items = selected.map((url, index) => `<li><a href="${url}">Public comment ${(page - 1) * PAGE_SIZE + index + 1}</a></li>`).join('');
	const display = data.identity.profile?.displayName || data.identity.alias?.name || aliasId;
	const canonical = `https://awtsmoos.com/@/${encodeSegment(aliasId)}/comments/${page}`;
	const response = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>${escapeHtml(display)} public comments — page ${page} | Awtsmoos</title><meta name="description" content="Public comments by ${escapeHtml(display)} on Awtsmoos."><meta name="robots" content="index,follow"><link rel="canonical" href="${canonical}"></head><body><main><p><a href="/@/${encodeSegment(aliasId)}">Back to @${escapeHtml(aliasId)}</a></p><h1>${escapeHtml(display)} public comments</h1><ol>${items}</ol>${navigation(aliasId, page, pageCount)}</main></body></html>`;
	return { mimeType: 'text/html; charset=utf-8', response };
}

module.exports = { PAGE_SIZE, renderAliasCommentsPage };
