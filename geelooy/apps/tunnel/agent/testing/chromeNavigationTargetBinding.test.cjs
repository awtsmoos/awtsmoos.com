// B"H
const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const net = require("node:net");
const os = require("node:os");
const path = require("node:path");

const installRoot = path.join(os.tmpdir(), `awtsmoos-navigation-binding-${process.pid}`);
process.env.AWTSMOOS_INSTALL_ROOT = installRoot;

const Actions = require("../tools/chrome/actions.js");
const cdp = require("../tools/chrome/cdp.js");
const { findChrome } = require("../tools/chrome/finder.js");

async function freePort() {
	const server = net.createServer();
	await new Promise((resolve, reject) => {
		server.once("error", reject);
		server.listen(0, "127.0.0.1", resolve);
	});
	const port = server.address().port;
	await new Promise(resolve => server.close(resolve));
	return port;
}

function page(title, body) {
	return `data:text/html,${encodeURIComponent(`<!doctype html><title>${title}</title><main id="proof">${body}</main>`)}`;
}

async function run() {
	assert.equal(Actions.urlOf({ url:"   ", p:"https://legacy.example/p" }, ""), "https://legacy.example/p");
	assert.equal(Actions.urlOf({ href:"", params:{ path:"https://legacy.example/path" } }, ""), "https://legacy.example/path");
	assert.equal(cdp.navigationLocationMatches("about:blank", "https://example.test/", "about:blank"), false);
	assert.equal(cdp.navigationLocationMatches("https://example.test/old", "https://example.test/new", "https://example.test/old"), false);
	assert.equal(cdp.navigationLocationMatches("https://example.test/new", "https://example.test/new", "https://example.test/old"), true);
	assert.equal(cdp.navigationLocationMatches("https://example.test/login", "https://example.test/new", "https://example.test/old"), true);

	const chromePath = findChrome();
	if (!chromePath) {
		console.log(JSON.stringify({
			ok: true,
			suite: "chrome-navigation-target-binding",
			skippedRealChrome: true,
			reason: "chrome_not_installed",
			pureContractVerified: true
		}, null, 2));
		return;
	}

	const profile = await fs.mkdtemp(path.join(os.tmpdir(), "awtsmoos-navigation-profile-"));
	const port = await freePort();
	let launchPid = null;
	let scopedTargetId = null;
	let reusedTargetId = null;
	try {
		const launched = await Actions.chromeLaunch({
			port,
			chromePath,
			userDataDir: profile,
			headless: true,
			persist: false,
			timeoutMs: 20000
		});
		assert.equal(launched.ok, true, JSON.stringify(launched));
		launchPid = launched.pid;
		assert.notEqual(launched.navigation.href, "about:blank");
		assert.equal(launched.chromeTargetId, launched.navigation.chromeTargetId);
		assert.ok(cdp.managedTargetSnapshot().includes(launched.chromeTargetId));
		const reuseUrl = page("Owned Reuse", "OWNED_REUSE_WORKS");
		const reused = await Actions.chromeLaunch({
			port,
			chromePath,
			userDataDir: profile,
			headless: true,
			persist: false,
			reuseExisting: true,
			url: reuseUrl,
			timeoutMs: 15000
		});
		assert.equal(reused.ok, true, JSON.stringify(reused));
		assert.equal(reused.reusedExisting, true);
		assert.equal(reused.pid, launchPid);
		assert.equal(reused.navigation.href, reuseUrl);
		reusedTargetId = reused.chromeTargetId;
		assert.notEqual(reusedTargetId, launched.chromeTargetId);

		const legacyUrl = page("Legacy P Alias", "P_ALIAS_WORKS");
		const navigated = await Actions.chromeNavigate({
			port,
			p: legacyUrl,
			browserSessionId: "binding-scope-a",
			timeoutMs: 15000
		});
		assert.equal(navigated.ok, true, JSON.stringify(navigated));
		assert.equal(navigated.reportedUrl, legacyUrl);
		assert.equal(navigated.verifiedHref, legacyUrl);
		assert.equal(navigated.targetBound, true);
		scopedTargetId = navigated.chromeTargetId;
		assert.notEqual(scopedTargetId, launched.chromeTargetId,
			"a new scope must not hijack the existing managed launch page");

		const evaluated = await Actions.chromeEval({
			port,
			chromeTargetId: scopedTargetId,
			browserSessionId: "binding-scope-a",
			command: "({href:location.href,title:document.title,text:document.querySelector('#proof')?.textContent})"
		});
		assert.equal(evaluated.ok, true, JSON.stringify(evaluated));
		assert.equal(evaluated.chromeTargetId, scopedTargetId);
		assert.deepEqual(evaluated.result.result.valueSummary.value, {
			href: legacyUrl,
			title: "Legacy P Alias",
			text: "P_ALIAS_WORKS"
		});

		const pathUrl = page("Legacy Path Alias", "PATH_ALIAS_WORKS");
		const viaPath = await Actions.chromeNavigate({
			port,
			path: pathUrl,
			chromeTargetId: scopedTargetId,
			browserSessionId: "binding-scope-a",
			timeoutMs: 15000
		});
		assert.equal(viaPath.ok, true, JSON.stringify(viaPath));
		assert.equal(viaPath.chromeTargetId, scopedTargetId);
		assert.equal(viaPath.verifiedHref, pathUrl);

		const missing = await Actions.chromeNavigate({
			port,
			url: "   ",
			p: "",
			chromeTargetId: scopedTargetId,
			browserSessionId: "binding-scope-a"
		});
		assert.equal(missing.ok, false);
		assert.equal(missing.error, "missing_navigation_url");
		assert.equal(missing.reportedUrl, "");

		const stillPath = await Actions.chromeEval({
			port,
			chromeTargetId: scopedTargetId,
			browserSessionId: "binding-scope-a",
			expression: "({href:location.href,title:document.title})"
		});
		assert.deepEqual(stillPath.result.result.valueSummary.value, {
			href: pathUrl,
			title: "Legacy Path Alias"
		});

		const targets = await Actions.chromeTargets({ port });
		const launchTarget = targets.targets.find(target => target.id === launched.chromeTargetId);
		assert.ok(launchTarget, "launch target must remain open");
		assert.notEqual(launchTarget.url, pathUrl, "scoped navigation must not hijack launch target");
		assert.ok(targets.targets.some(target => target.id === reusedTargetId && target.url === reuseUrl));

		await Actions.chromeClosePage({
			port,
			chromeTargetId: reusedTargetId,
			force: true
		});
		reusedTargetId = null;

		await Actions.chromeClosePage({
			port,
			chromeTargetId: scopedTargetId,
			browserSessionId: "binding-scope-a"
		});
		scopedTargetId = null;
		const stopped = await Actions.chromeStop({ port, pid:launchPid, force:true });
		assert.equal(stopped.ok, true, JSON.stringify(stopped));
		launchPid = null;

		console.log(JSON.stringify({
			ok: true,
			suite: "chrome-navigation-target-binding",
			legacyPAliasNavigated: true,
			legacyPathAliasNavigated: true,
			missingUrlRejected: true,
			finalHrefVerified: true,
			exactTargetEvaluation: true,
			unrelatedTargetNotHijacked: true,
			ownedBrowserReusedWithoutRespawn: true,
			launchNeverReportedAboutBlank: true
		}, null, 2));
	} finally {
		if (scopedTargetId) {
			await Actions.chromeClosePage({
				port,
				chromeTargetId: scopedTargetId,
				browserSessionId: "binding-scope-a",
				force: true
			}).catch(() => {});
		}
		if (reusedTargetId) {
			await Actions.chromeClosePage({
				port,
				chromeTargetId: reusedTargetId,
				force: true
			}).catch(() => {});
		}
		if (launchPid) {
			await Actions.chromeStop({ port, pid:launchPid, force:true }).catch(() => {});
		}
		await fs.rm(profile, { recursive:true, force:true });
		await fs.rm(installRoot, { recursive:true, force:true });
		await fs.rm(`${installRoot}-recovery`, { recursive:true, force:true });
	}
}

run().catch(error => {
	console.error(error?.stack || error);
	process.exitCode = 1;
});
