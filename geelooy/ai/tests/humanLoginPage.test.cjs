// B"H

const assert = require("node:assert/strict");
const test = require("node:test");
const { ensureHumanLoginPage } = require("../relay/split-browser/humanLoginPage.cjs");

test("creates one human ChatGPT page after keeper reconciliation", async () => {
	const calls = [];
	let pages = [{ id: "keeper", type: "page", url: "data:text/html,keeper" }];
	const result = await ensureHumanLoginPage({
		debugPort: 9223,
		url: "https://chatgpt.com/g/g-awtsmoos",
		async requestJson(url, method = "GET") {
			calls.push({ url, method });
			if (url.includes("/json/new?")) {
				pages = [...pages, {
					id: "login",
					type: "page",
					url: "https://chatgpt.com/g/g-awtsmoos"
				}];
				return {};
			}
			return pages;
		}
	});
	assert.equal(result.targetId, "login");
	assert.equal(calls.filter(call => call.method === "PUT").length, 1);
	assert.equal(pages.some(page => page.id === "keeper"), true);
});

test("reuses an existing human ChatGPT page", async () => {
	let calls = 0;
	const result = await ensureHumanLoginPage({
		debugPort: 9223,
		url: "https://chatgpt.com/g/g-awtsmoos",
		async requestJson() {
			calls += 1;
			return [{ id: "existing", type: "page", url: "https://chatgpt.com/" }];
		}
	});
	assert.equal(result.targetId, "existing");
	assert.equal(calls, 1);
});
