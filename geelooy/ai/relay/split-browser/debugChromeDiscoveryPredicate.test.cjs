// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const http = require("node:http");
const test = require("node:test");
const { findPageTarget } = require("./debugChromeDiscovery.cjs");

/**
 * @file Guards Shliach discovery against selecting the inert keeper page.
 * @description
 * The Awtsmoos may keep an inert bootstrap page first in DevTools order.
 * Awtsmoos.com must still select the actual ChatGPT surface when asked.
 */
test("page predicate skips keeper and selects ChatGPT", async () => {
	const pages = [
		page("KEEPER", "data:text/html,Awtsmoos%20Debug%20Browser"),
		page("SHLIACH", "https://chatgpt.com/g/g-awtsmoos")
	];
	const server = http.createServer((request, response) => {
		response.writeHead(200, { "Content-Type": "application/json" });
		response.end(JSON.stringify(pages));
	});
	await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
	try {
		const port = server.address().port;
		const result = await findPageTarget({
			preferredPort: port,
			onlyPreferred: true,
			pagePredicate: item => String(item.url || "").startsWith("https://chatgpt.com/")
		});
		assert.equal(result.ok, true);
		assert.equal(result.url, "https://chatgpt.com/g/g-awtsmoos");
	} finally {
		await new Promise(resolve => server.close(resolve));
	}
});

function page(id, url) {
	return {
		id,
		type: "page",
		url,
		title: id,
		webSocketDebuggerUrl: `ws://127.0.0.1/devtools/page/${id}`
	};
}
