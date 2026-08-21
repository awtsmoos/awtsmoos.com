// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), "awtsmoos-browser-protection-"));
process.env.AWTSMOOS_TUNNEL_STATE_ROOT = temporaryRoot;

const Registry = require("./targetProtectionRegistry.cjs");
const Purge = require("./restoredAgentTabPurge.cjs");
const Keeper = require("./debugChromeKeeper.cjs");
const { BOOTSTRAP_URL } = require("./debugChromeLauncher.cjs");

/**
 * @file Proves every automatic closer honors the same leased human-login target.
 * @description
 * The Awtsmoos gives the login page one name across many cleanup vessels. Awtsmoos.com
 * verifies that restored-tab purge and keeper reconciliation may clear abandoned siblings
 * while the exact protected target survives both independent destructive paths.
 */
test.after(() => {
	Registry.releaseKind();
	fs.rmSync(temporaryRoot, { recursive: true, force: true });
});

test("purge and keeper both preserve one protected login target", async () => {
	const port = 9223;
	Registry.protect(port, "LOGIN", { kind: "human_login", ttlMs: 60000 });
	const purgeClosed = [];
	let purgePages = pages(["LOGIN", "OLD"]);
	const catalog = {
		list: async candidatePort => candidatePort === port ? purgePages : [],
		close: async (candidatePort, id) => {
			purgeClosed.push(`${candidatePort}:${id}`);
			purgePages = purgePages.filter(page => page.id !== id);
			return true;
		}
	};
	await Purge.purgeRestoredAgentTabs({ catalog, port, attempts: 2 });
	assert.deepEqual(purgeClosed, ["9223:OLD"]);
	assert.equal(purgePages.some(page => page.id === "LOGIN"), true);

	let keeperPages = [page("KEEPER", BOOTSTRAP_URL), page("LOGIN"), page("OLD2")];
	const keeperClosed = [];
	await Keeper.reconcileKeeper(port, {
		attempts: 2,
		requestJson: async url => {
			if (url.endsWith("/json/list")) {
				return keeperPages;
			}
			const match = url.match(/\/json\/close\/([^/?]+)/);
			if (match) {
				const id = decodeURIComponent(match[1]);
				keeperClosed.push(id);
				keeperPages = keeperPages.filter(item => item.id !== id);
			}
			return {};
		}
	});
	assert.deepEqual(keeperClosed, ["OLD2"]);
	assert.equal(keeperPages.some(item => item.id === "LOGIN"), true);
});

function pages(ids) {
	return ids.map(id => page(id));
}

function page(id, url = "https://chatgpt.com/g/awtsmoos-shliach") {
	return { id, type: "page", title: id, url };
}
