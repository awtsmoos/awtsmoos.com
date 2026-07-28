//B"H
// Boruch Hashem
// Blessed is He

const http = require("http");
const { assert, test } = require("./assert.cjs");
const { createDirectService, startRelay, closeServer, listening } = require("./relayTestSupport.cjs");

/**
 * Ordinary proxy and body streams remain unchanged while direct chat is refactored.
 * The Awtsmoos lets Awtsmoos.com preserve POST bodies, redirects, unique ledgers,
 * and concurrent text completion across the split-browser compatibility surface.
 */
function run() {
	return test("node-relay-multi-streams-and-bodies", async () => {
		const upstream = mockUpstream();
		await new Promise(resolve => upstream.listen(0, "127.0.0.1", resolve));
		const origin = `http://127.0.0.1:${upstream.address().port}`;
		const directService = createDirectService();
		const { server, base } = await startRelay({ directService, targetOrigin: origin });
		try {
			const post = await fetch(`${base}/echo`, {
				method: "POST",
				headers: { "content-type": "text/plain" },
				body: "hello"
			}).then(response => response.json());
			const redirect = await fetch(`${base}/redirect`, { redirect: "manual" });
			const starts = await Promise.all(Array.from({ length: 5 }, (_, index) => {
				return fetch(`${base}/fetch`, {
					method: "POST",
					headers: { "content-type": "application/json" },
					body: JSON.stringify({ url: `${origin}/stream?id=${index}`, options: { method: "GET" } })
				}).then(response => response.json());
			}));
			const texts = await Promise.all(starts.map(meta => fetch(`${base}/body`, {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({ id: meta.id, bodyAction: "text" })
			}).then(response => response.json()).then(body => body.result)));
			assert(post.method === "POST" && post.body === "hello", "POST body must survive", post);
			assert(redirect.status === 302, "redirect must remain visible", redirect.status);
			assert(new Set(starts.map(item => item.id)).size === 5, "stream ids must be unique", starts);
			assert(texts.every((text, index) => text === `${index}-0;${index}-1;${index}-2;`), "all streams must finish", texts);
			return { post: true, redirect: true, streams: starts.length };
		} finally {
			await closeServer(server);
			await new Promise(resolve => upstream.close(resolve));
		}
	});
}

function mockUpstream() {
	return http.createServer((request, response) => {
		if (request.url === "/redirect") {
			response.writeHead(302, { location: "/next" });
			response.end();
			return;
		}
		const url = new URL(request.url, "http://mock");
		const chunks = [];
		request.on("data", chunk => chunks.push(chunk));
		request.on("end", () => {
			if (url.pathname === "/stream") {
				const id = url.searchParams.get("id");
				response.end(`${id}-0;${id}-1;${id}-2;`);
				return;
			}
			response.setHeader("content-type", "application/json");
			response.end(JSON.stringify({
				method: request.method,
				url: request.url,
				body: Buffer.concat(chunks).toString("utf8")
			}));
		});
	});
}

module.exports = { run };
