// B"H

const assert = require("node:assert/strict");
const test = require("node:test");
const { reconcileKeeper } = require("../relay/split-browser/debugChromeKeeper.cjs");
const { BOOTSTRAP_URL } = require("../relay/split-browser/debugChromeLauncher.cjs");

test("keeper reconciliation waits for asynchronous target disappearance", async () => {
	let pages = [
		{ id: "keeper", type: "page", url: BOOTSTRAP_URL },
		{ id: "root", type: "page", url: "https://chatgpt.com/" }
	];
	let closeChecks = 0;
	const result = await reconcileKeeper(9223, {
		sleep: async () => {
			closeChecks += 1;
			if (closeChecks === 2) pages = pages.filter(page => page.id === "keeper");
		},
		requestJson: async (url, method = "GET") => {
			if (url.endsWith("/json/list")) return pages;
			if (url.includes("/json/close/") && method === "GET") return { Result: "Target is closing" };
			throw new Error(`unexpected:${method}:${url}`);
		}
	});
	assert.equal(result.ok, true);
	assert.equal(result.pageCount, 1);
	assert.ok(result.closedPages >= 1);
	assert.equal(closeChecks, 2);
});
