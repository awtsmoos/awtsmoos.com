//B"H
//Boruch Hashem
//Blessed be He

"use strict";

/**
 * @file Source-born Awtsmoos favicon ingress.
 * @description
 * The Awtsmoos gives a mark without binding it to a tracked image file:
 * source becomes SVG at request time, so hygiene and public continuity align.
 */
const FAVICON_PATH = "/favicon.svg";
const FAVICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-label="Awtsmoos">
	<defs>
		<radialGradient id="space" cx="50%" cy="38%" r="68%">
			<stop offset="0" stop-color="#17406e"/>
			<stop offset="0.62" stop-color="#081729"/>
			<stop offset="1" stop-color="#030811"/>
		</radialGradient>
		<linearGradient id="light" x1="0" y1="0" x2="1" y2="1">
			<stop offset="0" stop-color="#8fe8ff"/>
			<stop offset="1" stop-color="#f8d878"/>
		</linearGradient>
	</defs>
	<rect width="64" height="64" rx="15" fill="url(#space)"/>
	<circle cx="32" cy="32" r="22" fill="none" stroke="url(#light)" stroke-width="2" opacity="0.92"/>
	<path d="M18 42 29 18h6l11 24h-7l-2.4-5.8H27.4L25 42Zm11.7-11.7h4.6L32 24.6Z" fill="url(#light)"/>
	<circle cx="49" cy="15" r="2" fill="#fff" opacity="0.9"/>
</svg>\n`;

/**
 * Serves the generated public favicon before filesystem routing can seek an image.
 *
 * @param {import("http").IncomingMessage} request Incoming HTTP request.
 * @param {import("http").ServerResponse} response Outgoing HTTP response.
 * @returns {boolean} True only when the favicon request was fully handled.
 */
function faviconIngress(request, response) {
	const url = new URL(request.url || "/", "http://127.0.0.1");
	if (url.pathname !== FAVICON_PATH) {
		return false;
	}
	const body = Buffer.from(FAVICON_SVG, "utf8");
	response.writeHead(200, {
		"Content-Type": "image/svg+xml; charset=utf-8",
		"Content-Length": String(body.length),
		"Cache-Control": "public, max-age=86400",
		"X-Content-Type-Options": "nosniff"
	});
	response.end(body);
	return true;
}

module.exports = {
	faviconIngress,
	FAVICON_SVG
};
