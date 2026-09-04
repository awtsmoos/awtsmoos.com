// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file aliasPage.js
 * @description
 * The Awtsmoos reveals each real public alias before JavaScript awakens, joining name, profile, authored Torah, discussion, and structured identity in place;
 * Awtsmoos.com keeps the familiar hydrator alive while safe public HTML and ProfilePage meaning already give every validated identity a searchable face.
 */

const { escapeHtml, encodeSegment, excerpt } = require('../../seo/html.js');
const { loadAliasData } = require('./aliasData.js');
const { renderAuthoredPosts } = require('./aliasPosts.js');
const { renderAliasStructuredData, safePublicUrl } = require('./aliasStructuredData.js');

function profileBody(data) {
	const { identity, aliasId, authoredPosts, commentUrls } = data;
	const profile = identity.profile || {};
	const interests = Array.isArray(profile.interests) ? profile.interests : [];
	const website = safePublicUrl(profile.website);
	const commentLink = commentUrls.length
		? `<a href="/@/${encodeSegment(aliasId)}/comments/1">Browse ${commentUrls.length} public comment${commentUrls.length === 1 ? '' : 's'}</a>`
		: '<span>No indexed public comments yet.</span>';
	return `<main data-awtsmoos-alias-ssr>
		<header><p>Public Awtsmoos alias</p><h1>${escapeHtml(profile.displayName || identity.alias?.name || aliasId)}</h1><p>@${escapeHtml(aliasId)}</p></header>
		${profile.bio ? `<p>${escapeHtml(profile.bio)}</p>` : ''}
		${profile.location ? `<p>Location: ${escapeHtml(profile.location)}</p>` : ''}
		${website ? `<p><a href="${escapeHtml(website)}" rel="nofollow">Website</a></p>` : ''}
		${interests.length ? `<section><h2>Interests</h2><ul>${interests.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul></section>` : ''}
		${renderAuthoredPosts(authoredPosts)}
		<section><h2>Public discussion</h2><p>${commentLink}</p></section>
	</main>`;
}

function documentFor(data) {
	const { identity, aliasId } = data;
	const display = identity.profile?.displayName || identity.alias?.name || aliasId;
	const description = excerpt(identity.profile?.bio || identity.alias?.description || `Public Awtsmoos alias @${aliasId}.`, 220);
	const canonical = `https://awtsmoos.com/@/${encodeSegment(aliasId)}`;
	const structured = renderAliasStructuredData(data, canonical, description, display);
	return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escapeHtml(display)} (@${escapeHtml(aliasId)}) | Awtsmoos</title><meta name="description" content="${escapeHtml(description)}"><meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1"><link rel="canonical" href="${canonical}">${structured}<link rel="stylesheet" href="/style/social/profile/index.css"></head><body data-alias-id="${escapeHtml(aliasId)}"><div id="public-profile-root" aria-live="polite">${profileBody(data)}</div><script type="module" src="/scripts/awtsmoos/social/profile/index.js"></script></body></html>`;
}

/** @description Renders one public alias as useful first-response HTML or a noindex missing page. */
async function renderAliasPage($i, aliasId) {
	const data = await loadAliasData($i, aliasId);
	if (!data) {
		return {
			statusCode: 404,
			mimeType: 'text/html; charset=utf-8',
			response: '<!DOCTYPE html><html><head><title>Alias unavailable | Awtsmoos</title><meta name="robots" content="noindex,follow"></head><body><main><h1>Alias unavailable</h1></main></body></html>'
		};
	}
	return { mimeType: 'text/html; charset=utf-8', response: documentFor(data) };
}

module.exports = { documentFor, profileBody, renderAliasPage };
