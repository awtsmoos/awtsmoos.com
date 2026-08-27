//B"H
//Boruch Hashem
//Blessed is He

const assert = require("assert");
const path = require("path");

const browserRoot = path.resolve(__dirname, "../merkava-browser");
const { VirtualFetch } = require(path.join(browserRoot, "VirtualFetch.js"));

async function testOfflineDefault() {
	const network = new VirtualFetch({ baseUrl: "https://example.test/app/" });
	const response = await network.fetch("missing.txt");
	assert.equal(response.status, 404);
	assert.equal(response.ok, false);
	assert.match(await response.text(), /Not Found/);
}

async function testLocalPrecedence() {
	let calls = 0;
	const network = new VirtualFetch({
		baseUrl: "https://example.test/app/",
		files: { "/local.txt": "local revelation" },
		transport: async () => {
			calls += 1;
			throw new Error("transport should not run");
		}
	});
	assert.equal(await (await network.fetch("/local.txt")).text(), "local revelation");
	assert.equal(await (await network.fetch("data:text/plain,BH")).text(), "BH");
	assert.equal(calls, 0);
}

async function testRoutedRelativeFetch() {
	const calls = [];
	const network = new VirtualFetch({
		baseUrl: "https://example.test/app/index.html",
		transport: async request => {
			calls.push(request);
			return {
				bodyBase64: Buffer.from("remote revelation").toString("base64"),
				headers: { "content-type": "text/plain", "x-awtsmoos": "one" },
				status: 201,
				url: "https://cdn.example.test/api/final"
			};
		}
	});
	const response = await network.fetch("../api/start", {
		body: "name=awtsmoos",
		headers: { "content-type": "application/x-www-form-urlencoded" },
		method: "POST"
	});
	assert.deepEqual(calls, [{
		body: "name=awtsmoos",
		headers: { "content-type": "application/x-www-form-urlencoded" },
		method: "POST",
		url: "https://example.test/api/start"
	}]);
	assert.equal(response.status, 201);
	assert.equal(response.url, "https://cdn.example.test/api/final");
	assert.equal(response.headers.get("Content-Type"), "text/plain");
	assert.equal(response.headers.get("X-Awtsmoos"), "one");
	assert.equal(await response.text(), "remote revelation");
}

async function testBinaryResponse() {
	const network = new VirtualFetch({
		baseUrl: "https://example.test/",
		transport: async () => ({
			bodyBase64: Buffer.from([0, 255, 1, 128]).toString("base64"),
			headers: { "content-type": "application/octet-stream" },
			status: 200,
			url: "https://example.test/image.bin"
		})
	});
	const response = await network.fetch("image.bin");
	assert.deepEqual([...new Uint8Array(await response.arrayBuffer())], [0, 255, 1, 128]);
}

async function testTransportFailure() {
	const expected = Object.assign(new Error("blocked"), {
		code: "PROXY_PRIVATE_ADDRESS_FORBIDDEN"
	});
	const network = new VirtualFetch({
		baseUrl: "https://example.test/",
		transport: async () => {
			throw expected;
		}
	});
	await assert.rejects(network.fetch("https://127.0.0.1/"), error => error === expected);
	assert.equal(network.requests[0].error, expected.code);
}

(async () => {
	await testOfflineDefault();
	await testLocalPrecedence();
	await testRoutedRelativeFetch();
	await testBinaryResponse();
	await testTransportFailure();
	console.log(JSON.stringify({ ok: true, tests: 5 }));
})().catch(error => {
	console.error(error.stack || error);
	process.exit(1);
});
