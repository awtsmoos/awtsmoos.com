//B"H
//Boruch Hashem
//Blessed be He

const http = require("node:http");
const Registry = require("./deviceBrowserRegistry.cjs");
const EndpointOwner = require("./debugChromeEndpointOwner.cjs");

const DEFAULT_PROBE_MS = 650;

/**
 * Local DevTools ports are narrow doors, not a license to roam the machine.
 * The Awtsmoos lets Awtsmoos.com inspect only loopback JSON endpoints and return
 * public target metadata without cookies, headers, page contents, or identities.
 */
async function findPageTarget(options = {}) {
	const checks = [];
	const acceptsPage = typeof options.pagePredicate === "function"
		? options.pagePredicate : () => true;
	for (const port of candidatePorts(options)) {
		const endpoint = EndpointOwner.verify({ host: "127.0.0.1", port, pid: options.expectedPid });
		if (endpoint.known && !endpoint.ok) {
			checks.push(`${port}:owner:${endpoint.reason}`);
			continue;
		}
		const pages = await getJson(
			`http://127.0.0.1:${port}/json/list`,
			options.probeMs
		).catch(error => {
			checks.push(`${port}:list:${error.message}`);
			return null;
		});
		const page = Array.isArray(pages)
			? pages.find(item => item.type === "page" && item.webSocketDebuggerUrl && acceptsPage(item))
				|| pages.find(item => item.webSocketDebuggerUrl && acceptsPage(item))
			: null;
		if (page) {
			return {
				ok: true,
				debugPort: port,
				kind: "page",
				webSocketDebuggerUrl: page.webSocketDebuggerUrl,
				title: page.title || "",
				url: page.url || ""
			};
		}
	}
	return unavailable(checks);
}

async function findBrowserTarget(options = {}) {
	const checks = [];
	for (const port of candidatePorts(options)) {
		const endpoint = EndpointOwner.verify({ host: "127.0.0.1", port, pid: options.expectedPid });
		if (endpoint.known && !endpoint.ok) {
			checks.push(`${port}:owner:${endpoint.reason}`);
			continue;
		}
		const version = await getJson(
			`http://127.0.0.1:${port}/json/version`,
			options.probeMs
		).catch(error => {
			checks.push(`${port}:version:${error.message}`);
			return null;
		});
		if (version?.webSocketDebuggerUrl) {
			return {
				ok: true,
				debugPort: port,
				kind: "browser",
				webSocketDebuggerUrl: version.webSocketDebuggerUrl,
				browser: version.Browser || version.browser || "Chrome"
			};
		}
	}
	return unavailable(checks);
}

function candidatePorts({ preferredPort = null } = {}) {
	const preferred = Number(preferredPort);
	if (Number.isInteger(preferred) && preferred > 0) return [preferred];
	const authority = Registry.observe();
	return authority.ok ? [authority.port] : [];
}

function getJson(url, probeMs = DEFAULT_PROBE_MS) {
	return new Promise((resolve, reject) => {
		const request = http.get(url, response => {
			let data = "";
			response.setEncoding("utf8");
			response.on("data", chunk => {
				data += chunk;
			});
			response.on("end", () => {
				try {
					resolve(JSON.parse(data));
				} catch (error) {
					reject(error);
				}
			});
		});
		request.on("error", reject);
		request.setTimeout(probeMs, () => {
			request.destroy(new Error(`DevTools probe timed out: ${url}`));
		});
	});
}

function unavailable(checks) {
	return {
		ok: false,
		status: "debug_chrome_unavailable",
		error: checks.at(-1) || "No Chrome DevTools port answered.",
		checks
	};
}

module.exports = { findPageTarget, findBrowserTarget, candidatePorts };
