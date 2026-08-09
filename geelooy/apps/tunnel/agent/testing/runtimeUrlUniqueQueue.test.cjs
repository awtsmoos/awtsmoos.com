// B"H
const assert = require("node:assert/strict");
const http = require("node:http");
const {
	buildRuntimeUrlEnv
} = require("../tools/fs/runtimeUrlEnv.js");

const sources = {
	"/index.html": "<script type=\"module\" src=\"./a.js\"></script><script type=\"module\" src=\"./b.js\"></script>",
	"/a.js": "import './shared.js';",
	"/b.js": "import './shared.js'; import './late.js';",
	"/shared.js": "export const shared = true;",
	"/late.js": "export const late = true;"
};

async function listen() {
	const server = http.createServer((request, response) => {
		const source = sources[new URL(request.url, "http://localhost").pathname];
		response.statusCode = source === undefined ? 404 : 200;
		response.setHeader("content-type", "text/javascript");
		response.end(source || "missing");
	});
	await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
	return server;
}

(async () => {
	const server = await listen();
	try {
		const address = server.address();
		const result = await buildRuntimeUrlEnv({
			url: `http://127.0.0.1:${address.port}/index.html`,
			maxFiles: 5
		});
		assert.equal(result.ok, true);
		assert.deepEqual(Object.keys(result.files), [
			"index.html",
			"a.js",
			"b.js",
			"shared.js",
			"late.js"
		]);
		console.log(JSON.stringify({
			ok: true,
			suite: "runtime-url-unique-queue",
			uniqueFiles: Object.keys(result.files).length,
			lateDependencyCollected: true
		}, null, 2));
	} finally {
		await new Promise(resolve => server.close(resolve));
	}
})().catch(error => {
	console.error(error.stack || error.message);
	process.exit(1);
});
