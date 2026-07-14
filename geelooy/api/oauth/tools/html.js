// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module OAuthHtmlTools
 * @description
 * OAuth documents remain standalone but follow the same calm Geelooy control law.
 */

const LT = String.fromCharCode(60);
const GT = String.fromCharCode(62);

function esc(value) {
	return String(value ?? '')
		.replace(/&/g, '&amp;')
		.replace(new RegExp(LT, 'g'), '&lt;')
		.replace(new RegExp(GT, 'g'), '&gt;')
		.replace(/"/g, '&quot;');
}

function tag(name, attrs = {}, body = '') {
	const pairs = Object.entries(attrs)
		.filter(pair => pair[1] !== undefined && pair[1] !== null && pair[1] !== false)
		.map(pair => ` ${pair[0]}="${esc(pair[1])}"`)
		.join('');
	return LT + name + pairs + GT + body + LT + '/' + name + GT;
}

function documentCss() {
	return [
		':root{color-scheme:light dark;font-family:Inter,ui-sans-serif,system-ui,sans-serif}',
		'*{box-sizing:border-box}',
		'body{min-height:100vh;margin:0;padding:clamp(16px,4vw,48px);background:linear-gradient(145deg,#07090f,#0b0e16);color:#f4f2ec;line-height:1.58}',
		'.box{width:min(100%,760px);margin:auto;padding:clamp(20px,5vw,40px);border:1px solid rgba(255,255,255,.12);border-radius:24px;background:#11151d;box-shadow:0 14px 34px rgba(0,0,0,.28)}',
		'.eyebrow{display:inline-flex;align-items:center;gap:7px;margin:0 0 8px;color:#d7b36a;font-size:12px;font-weight:800;letter-spacing:.11em;text-transform:uppercase}',
		'.eyebrow:before{width:7px;height:7px;border-radius:50%;background:currentColor;content:""}',
		'h1{margin:0 0 14px;font-size:clamp(34px,8vw,64px);line-height:.96;letter-spacing:-.055em}',
		'p{color:#b3bac5}',
		'a{color:#87d9e9}',
		'.oauthActions{display:flex;flex-wrap:wrap;gap:8px;margin:24px 0}',
		'a.button{display:inline-flex;min-height:44px;align-items:center;justify-content:center;gap:8px;padding:11px 14px;border:1px solid #236f73;border-radius:14px;background:#236f73;color:#fff;font-weight:750;text-decoration:none}',
		'a.button:after{content:"→";font-weight:900}',
		'.legalNotice,.technicalDetails{margin-top:18px;padding:14px;border:1px solid rgba(255,255,255,.1);border-radius:14px;background:#171c25}',
		'.small{font-size:13px;color:#8b95a4;word-break:break-word}',
		'summary{min-height:44px;padding:8px 0;cursor:pointer;font-weight:750}',
		'code{display:inline-block;max-width:100%;padding:3px 6px;border:1px solid rgba(255,255,255,.1);border-radius:7px;background:#202733;color:#f4f2ec;font-family:ui-monospace,monospace;overflow-wrap:anywhere}',
		':focus-visible{outline:3px solid #87d9e9;outline-offset:3px}',
		'@media(max-width:520px){.oauthActions{flex-direction:column}.oauthActions a{width:100%}}',
		'@media(prefers-reduced-motion:reduce){*{scroll-behavior:auto!important;transition:none!important}}'
	].join('');
}

function doc(opts) {
	return [
		'<!doctype html>',
		tag('html', { lang: 'en' }, [
			tag('head', {}, [
				tag('meta', { charset: 'utf-8' }, ''),
				tag('meta', { name: 'viewport', content: 'width=device-width,initial-scale=1,viewport-fit=cover' }, ''),
				tag('title', {}, esc(opts.title || 'Awtsmoos OAuth')),
				tag('style', {}, documentCss())
			].join('')),
			tag('body', {}, opts.body || '')
		].join(''))
	].join('');
}

module.exports = {
	esc,
	tag,
	doc,
	documentCss
};
