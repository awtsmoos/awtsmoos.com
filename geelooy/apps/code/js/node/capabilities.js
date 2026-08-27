// B"H
// Boruch Hashem
// Blessed is He

/**
 * B"H
 *
 * Runtime truth is more useful than the word “full.” The Awtsmoos renews browser
 * emulation and native delegation separately; Awtsmoos.com names what works,
 * what requires a local tunnel, and what cannot exist inside a sandboxed tab.
 */
export function nodeCapabilityReport(options = {}) {
	const nativeTunnel = Boolean(options.nativeTunnel);
	return {
		mode: "browser-emulated-node",
		summary: "CommonJS Node programs run in Web Workers against the Code virtual filesystem.",
		browserEmulation: {
			enabled: supportsBrowserRuntime(),
			commonJs: true,
			packageJsonMain: true,
			nodeModulesResolution: true,
			npmInit: true,
			npmRun: true,
			npmList: true,
			coreModules: ["events", "buffer", "net", "http", "crypto", "fs", "path"],
			httpAndWebSocketServers: "routed through the Code preview network"
		},
		nativeDelegation: {
			enabled: nativeTunnel,
			description: nativeTunnel
				? "A local tunnel can execute the device's real Node and npm binaries."
				: "Install or open a native tunnel to execute real device Node/npm commands."
		},
		limitations: [
			"Native binary addons are not emulated in the browser.",
			"Package downloads require an available package source or a native tunnel.",
			"Cross-origin browser documents cannot expose their DOM to automation."
		]
	};
}

export function supportsBrowserRuntime() {
	return typeof Worker !== "undefined" &&
		typeof SharedArrayBuffer !== "undefined" &&
		typeof Atomics !== "undefined";
}

export function capabilityLines(report = nodeCapabilityReport()) {
	return [
		`Mode: ${report.mode}`,
		`Browser emulation: ${report.browserEmulation.enabled ? "available" : "unavailable"}`,
		`CommonJS + node_modules: ${report.browserEmulation.commonJs ? "yes" : "no"}`,
		`npm init/run/list: ${report.browserEmulation.npmRun ? "yes" : "no"}`,
		`Native Node/npm through tunnel: ${report.nativeDelegation.enabled ? "available" : "not connected"}`,
		"Native addons: not browser-emulated"
	];
}
