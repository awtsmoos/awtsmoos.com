//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file aliasPage.js
 * @description
 * The Awtsmoos reveals each public alias before JavaScript awakens,
 * joining identity, Torah, discussion, and finished creations in one searchable face;
 * Awtsmoos.com keeps the hydrator alive while public Sites already offer truthful doors to visit, Remix, and create again.
 */
const { escapeHtml, encodeSegment, excerpt } = require('../../seo/html.js');
const { loadAliasData } = require('./aliasData.js');
const { renderAuthoredPosts } = require('./aliasPosts.js');
const { renderAliasStructuredData, safePublicUrl } = require('./aliasStructuredData.js');
const { loadPublicAliasSites, renderPublicAliasSites } = require('./aliasSites.js');

function profileBody(data) {
	const { identity, aliasId, authoredPosts, commentUrls } = data;
	const profile = identity.profile || {};
	const interests = Array.isArray(profile.interests) ? profile.interests : [];
	const website = safePublicUrl(profile.website);
	const displayName = escapeHtml(profile.displayName || identity.alias?.name || aliasId);
	const commentLink = renderCommentLink(aliasId, commentUrls);
	const interestList = interests.map(item => `<li>${escapeHtml(item)}</li>`).join('');
	return [
		'<main data-awtsmoos-alias-ssr>\n\t\t',
		`<header><p>Public Awtsmoos alias</p><h1>${displayName}</h1><p>@${escapeHtml(aliasId)}</p></header>`,
		'\n\t\t',
		profile.bio ? `<p>${escapeHtml(profile.bio)}</p>` : '',
		'\n\t\t',
		profile.location ? `<p>Location: ${escapeHtml(profile.location)}</p>` : '',
		'\n\t\t',
		website ? `<p><a href="${escapeHtml(website)}" rel="nofollow">Website</a></p>` : '',
		'\n\t\t',
		interests.length ? `<section><h2>Interests</h2><ul>${interestList}</ul></section>` : '',
		'\n\t\t',
		renderAuthoredPosts(authoredPosts),
		'\n\t\t<section><h2>Public discussion</h2><p>',
		commentLink,
		'</p></section>\n\t</main>'
	].join('');
}

function renderCommentLink(aliasId, commentUrls) {
	if (!commentUrls.length) return '<span>No indexed public comments yet.</span>';
	const count = commentUrls.length;
	const noun = count === 1 ? 'comment' : 'comments';
	return [
		`<a href="/@/${encodeSegment(aliasId)}/comments/1">`,
		`Browse ${count} public ${noun}</a>`
	].join('');
}

function documentFor(data, publicSites = []) {
	const { identity, aliasId } = data;
	const display = identity.profile?.displayName || identity.alias?.name || aliasId;
	const description = excerpt(
		identity.profile?.bio || identity.alias?.description || `Public Awtsmoos alias @${aliasId}.`,
		220
	);
	const canonical = `https://awtsmoos.com/@/${encodeSegment(aliasId)}`;
	const structured = renderAliasStructuredData(data, canonical, description, display);
	const storefront = renderPublicAliasSites(publicSites);
	return [
		'<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">',
		'<meta name="viewport" content="width=device-width, initial-scale=1">',
		`<title>${escapeHtml(display)} (@${escapeHtml(aliasId)}) | Awtsmoos</title>`,
		`<meta name="description" content="${escapeHtml(description)}">`,
		'<meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1">',
		`<link rel="canonical" href="${canonical}">${structured}`,
		'<link rel="stylesheet" href="/style/social/profile/index.css">',
		'<link rel="stylesheet" href="/style/social/profile/public-sites.css"></head>',
		`<body data-alias-id="${escapeHtml(aliasId)}">`,
		`<div id="public-profile-root" aria-live="polite">${profileBody(data)}</div>`,
		`<div id="published-creations-root" aria-live="polite">${storefront}</div>`,
		'<script type="module" src="/scripts/awtsmoos/social/profile/index.js"></script>',
		'<script type="module" src="/scripts/awtsmoos/social/profile/publicSites.js"></script>',
		'</body></html>'
	].join('');
}

/** @description Renders one public alias with indexable identity and readiness-verified public creations. */
async function renderAliasPage($i, aliasId) {
	const data = await loadAliasData($i, aliasId);
	if (!data) {
		return {
			statusCode: 404,
			mimeType: 'text/html; charset=utf-8',
			response: [
				'<!DOCTYPE html><html><head><title>Alias unavailable | Awtsmoos</title>',
				'<meta name="robots" content="noindex,follow"></head>',
				'<body><main><h1>Alias unavailable</h1></main></body></html>'
			].join('')
		};
	}
	const publicSites = await loadPublicAliasSites($i, aliasId);
	return {
		mimeType: 'text/html; charset=utf-8',
		response: documentFor(data, publicSites)
	};
}

module.exports = { documentFor, profileBody, renderAliasPage };
