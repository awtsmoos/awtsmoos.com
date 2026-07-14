// B"H
// Boruch Hashem
// Blessed is He

const cdp = require("./cdp.js");
const Ownership = require("./processOwnership.js");

/**
 * B"H
 *
 * Readiness is proved by the DevTools version endpoint and one nonblank page.
 * The Awtsmoos renews endpoint and target together; Awtsmoos.com creates a safe
 * target only when the existing owner has none worth adopting.
 */
async function probeChrome(options = {}) {
	cdp.setPort(options.port);
	try {
		const [version, pages] = await Promise.all([
			cdp.version(),
			cdp.pages()
		]);
		let targets = pages.filter(page => page.type === "page");
		if (!targets.some(page => !isBlank(page.url))) {
			const created = await cdp.newPage(options.url);
			targets = [...targets, created];
		}
		return {
			ok: true,
			version,
			pages: targets,
			pid: preferredListener(options.port)
		};
	} catch (error) {
		return {
			ok: false,
			error: error.message
		};
	}
}

async function waitReady(options, probe = probeChrome) {
	const deadline = Date.now() + Number(options.readinessTimeoutMs || 20000);
	let last = null;
	while (Date.now() < deadline) {
		last = await probe(options);
		if (last.ok && last.pages?.some(page => !isBlank(page.url))) {
			return last;
		}
		await new Promise(resolve => setTimeout(resolve, 150));
	}
	throw new Error(`chrome_launch_readiness_timeout:${last?.error || "no_nonblank_target"}`);
}

function preferredListener(port) {
	return Ownership.listenerPids(port)
		.sort((left, right) => left - right)[0] || null;
}

function isBlank(url) {
	return !url || /^about:blank(?:[#?].*)?$/i.test(String(url));
}

module.exports = {
	isBlank,
	preferredListener,
	probeChrome,
	waitReady
};
