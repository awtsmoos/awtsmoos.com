// B"H
// Boruch Hashem
// Blessed is He

const path = require("node:path");

/**
 * @file Builds deterministic Chrome launch vessels for tests without spawning a browser.
 * @description
 * The Awtsmoos lets tests mirror process birth without disturbing the living machine;
 * Awtsmoos.com counts readiness, ownership, cleanup, and targets in a bounded scene.
 */
function create(options = {}) {
	let clock = 0;
	let versionCalls = 0;
	let registered = options.records ? [...options.records] : [];
	const calls = {
		lease: 0,
		mark: 0,
		newPage: 0,
		persist: 0,
		spawn: 0,
		stop: 0,
		version: 0
	};
	const page = { id: "page-1", type: "page", url: "data:text/html,ready" };

	const dependencies = {
		ROOT: "/tmp/awtsmoos-test-root",
		ChromeProcesses: {
			register(record) {
				registered.push({ ...record });
				return record;
			},
			snapshot: () => registered.map(record => ({ ...record })),
			async stopOwned() {
				calls.stop += 1;
				return { ok: true, stopped: true };
			}
		},
		addChromeLog() {},
		boolish: (value, fallback = false) => value === undefined ? fallback : Boolean(value),
		cdp: {
			async version() {
				calls.version += 1;
				versionCalls += 1;
				if (options.versionReadyAt && versionCalls >= options.versionReadyAt) return { Browser: "Fake" };
				if (options.connected === true) return { Browser: "Fake" };
				throw new Error("not_ready");
			},
			async pages() {
				return options.noPages ? [] : [page];
			},
			async newPage() {
				calls.newPage += 1;
				return page;
			},
			markManagedTarget() {
				calls.mark += 1;
			},
			leaseTarget() {
				calls.lease += 1;
			}
		},
		chromeFindDetails: () => ({ candidates: [] }),
		chromeLaunchArgs: () => ["--fake"],
		compactLogs: value => value,
		findChrome: () => "/fake/chrome",
		fs: { chmodSync() {}, mkdirSync() {} },
		loadConfig: () => ({ chrome: { enabled: true, port: 9222 }, tools: { chrome: true } }),
		now: () => clock,
		path,
		readChromeLogs: () => ({ logs: [] }),
		safeLaunchUrl: value => value === "about:blank" ? "data:text/html,ready" : value,
		saveConfigPatch() {
			calls.persist += 1;
		},
		async sleep(milliseconds) {
			clock += milliseconds;
		},
		spawn() {
			calls.spawn += 1;
			return { pid: 4321, on() {}, unref() {} };
		}
	};

	return { calls, dependencies };
}

module.exports = {
	create
};
