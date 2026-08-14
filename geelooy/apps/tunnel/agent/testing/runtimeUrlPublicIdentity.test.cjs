// B"H
const assert = require("node:assert/strict");
const http = require("node:http");
const { buildRuntimeUrlEnv } = require("../tools/fs/runtimeUrlEnv.js");
const { simulateNodeDomRuntime } = require("../tools/fs/nodeDomRuntime/index.js");

const sources = {
	"/nested/app/index.html": '<main id="out"></main><script type="module" src="./src/main.js"></script>',
	"/nested/app/src/main.js": 'import { word } from "../../shared/word.js"; out.textContent = word;',
	"/nested/shared/word.js": 'export const word = "public-root-ok";'
};

async function listen() {
	const server = http.createServer((request, response) => {
		const source = sources[new URL(request.url, "http://localhost").pathname];
		response.statusCode = source === undefined ? 404 : 200;
		response.end(source || "missing");
	});
	await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
	return server;
}

(async () => {
	const server = await listen();
	try {
		const url = `http://127.0.0.1:${server.address().port}/nested/app/index.html`;
		const env = await buildRuntimeUrlEnv({ url, maxFiles: 8 });
		assert.equal(env.entry, "nested/app/index.html");
		assert.deepEqual(Object.keys(env.files), ["nested/app/index.html", "nested/app/src/main.js", "nested/shared/word.js"]);
		const result = await simulateNodeDomRuntime({ entry: env.entry, files: env.files, url, returnValues: ["out.textContent"] });
		assert.equal(result.ok, true);
		assert.equal(result.values["out.textContent"], "public-root-ok");
		console.log(JSON.stringify({ ok: true, entry: env.entry, files: Object.keys(env.files) }, null, 2));
	} finally {
		await new Promise(resolve => server.close(resolve));
	}
})().catch(error => { console.error(error.stack || error.message); process.exit(1); });
