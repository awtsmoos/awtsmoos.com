// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file friendlyDerech.js
 * @description
 * Builds the dynamic route table for one human-friendly sefer mount
 * (/tanya, /תניא, /likutei-torah, /לקוטי-תורה, /igeres-hakodesh, /אגרות-קודש).
 * Resolved paths 302-redirect to canonical reader URLs; anything else renders
 * a proper bilingual 404 page — never a hang, never a blank page.
 */

'use strict';

const { makeRedirectResponse, makeHtmlResponse } = require('../../../../ayzarim/awtsmoosDynamicServer/response/dynamicResponseShape.js');
const { resolveFriendlyPath } = require('./friendlyResolver.js');

const SEFER_TITLES = {
	'tanya': { en: 'Tanya', he: 'תניא' },
	'likutei-torah': { en: 'Likkutei Torah', he: 'לקוטי תורה' },
	'igeres-hakodesh': { en: 'Igeres HaKodesh', he: 'אגרות קודש' }
};

function escapeHtml(value) {
	return String(value)
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}

function renderNotFoundPage(seferKey, requestPath) {
	const titles = SEFER_TITLES[seferKey] || { en: 'Sefer', he: 'ספר' };
	const safePath = escapeHtml(requestPath || '/');
	return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Not found — ${escapeHtml(titles.en)}</title>
</head>
<body style="font-family:system-ui,sans-serif;max-width:34rem;margin:4rem auto;padding:0 1.5rem;line-height:1.6">
<h1>Not found</h1>
<p lang="he" dir="rtl">הדף לא נמצא</p>
<p>No ${escapeHtml(titles.en)} passage matches <code>${safePath}</code>.</p>
<p><a href="/">Awtsmoos.com home</a></p>
</body>
</html>`;
}

function renderRedirectFallback(destination) {
	const safe = escapeHtml(destination);
	return `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<meta http-equiv="refresh" content="0;url=${safe}">
<title>Opening…</title>
</head>
<body>
<p>Opening… <a href="${safe}">continue</a></p>
<script>location.replace(${JSON.stringify(destination).replace(/</g, '\\u003c')});</script>
</body>
</html>`;
}

/**
 * Creates the request handler for resolved friendly paths of one sefer.
 * @param {'tanya'|'likutei-torah'|'igeres-hakodesh'} seferKey Sefer mount key.
 * @param {string[]} segments Decoded path segments beneath the mount.
 * @returns {object} Wrapped dynamic response (302 redirect or 404 page).
 */
function handleFriendlyPath(seferKey, segments) {
	const resolution = resolveFriendlyPath(seferKey, segments);
	if (resolution.status === 'redirect') {
		return makeRedirectResponse(resolution.url, renderRedirectFallback(resolution.url));
	}
	return makeHtmlResponse(
		renderNotFoundPage(seferKey, '/' + segments.join('/')),
		404
	);
}

/**
 * Builds a dynamic route table for one friendly sefer mount.
 * Patterns are ordered specific-first; the terminal catch-all guarantees a
 * proper 404 page for anything unrecognized.
 * @param {'tanya'|'likutei-torah'|'igeres-hakodesh'} seferKey Sefer mount key.
 * @returns {Record<string, Function>} Route pattern -> handler.
 */
function createFriendlyRoutes(seferKey) {
	return {
		'/': async function renderSeferLanding() {
			return handleFriendlyPath(seferKey, []);
		},
		'/:a': async function renderFriendlyOne(vars) {
			return handleFriendlyPath(seferKey, [vars.a]);
		},
		'/:a/:b': async function renderFriendlyTwo(vars) {
			return handleFriendlyPath(seferKey, [vars.a, vars.b]);
		},
		'/:a/:b/:c': async function renderFriendlyThree(vars) {
			return handleFriendlyPath(seferKey, [vars.a, vars.b, vars.c]);
		},
		'/:rest*': async function renderFriendlyNotFound(vars) {
			// Four or more segments never resolve; the resolver answers notFound.
			const segments = String(vars.rest || '').split('/').filter(Boolean);
			return handleFriendlyPath(seferKey, segments);
		}
	};
}

/**
 * Creates the derech module function for one friendly sefer mount.
 * @param {'tanya'|'likutei-torah'|'igeres-hakodesh'} seferKey Sefer mount key.
 * @returns {Function} Derech function receiving $i.
 */
function createFriendlyDerech(seferKey) {
	return async function revealFriendlyRoutes($i) {
		await $i.use(createFriendlyRoutes(seferKey));
	};
}

module.exports = {
	createFriendlyDerech,
	createFriendlyRoutes,
	handleFriendlyPath,
	renderNotFoundPage
};
