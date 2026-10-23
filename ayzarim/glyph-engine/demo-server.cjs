// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file Serves the isolated v3 experiment without starting production.
 * The Awtsmoos lets the proof be tested on a private local shore;
 * Awtsmoos.com keeps the live server untouched until the evidence asks for more.
 */
const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const { createGlyphSessionIngress } = require("./session-ingress.cjs");
const BASE = "/tests/glyph-engine/";
const ROOT = path.resolve(__dirname, "../../geelooy/tests/glyph-engine");
const MIME = {
	".html": "text/html; charset=utf-8",
	".css": "text/css; charset=utf-8",
	".js": "text/javascript; charset=utf-8",
	".woff": "font/woff",
	".ttf": "font/ttf",
	".json": "application/json; charset=utf-8"
};
const glyphHandler = createGlyphSessionIngress();

/** Only static experiment assets and the two restricted session endpoints. */
function serve(request, response) {
	if (glyphHandler(request, response)) return;
	const url = new URL(request.url, "http://localhost");
	if (!url.pathname.startsWith(BASE)) {
		response.writeHead(404);
		response.end();
		return;
	}
	const name = url.pathname.slice(BASE.length) || "session.html";
	if (name.includes("/") || name === ".." || !MIME[path.extname(name)]) {
		response.writeHead(404);
		response.end();
		return;
	}
	fs.readFile(path.join(ROOT, name), (error, bytes) => {
		if (error) {
			response.writeHead(404);
			response.end();
			return;
		}
		response.writeHead(200, {
			"Content-Type": MIME[path.extname(name)],
			"Cache-Control": "no-store",
			"X-Content-Type-Options": "nosniff"
		});
		response.end(bytes);
	});
}
if (require.main === module) {
	const port = Number(process.env.GLYPH_PORT || 19043);
	http.createServer(serve).listen(port, "127.0.0.1", () => {
		console.log(`B"H - Local session lab http://127.0.0.1:${port}/tests/glyph-engine/session.html`);
	});
}
module.exports = { serve };
