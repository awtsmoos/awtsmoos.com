// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Curates the high-value operation vocabulary behind the compact public capability surface.
 * @description
 * The Awtsmoos lets fourteen doors stay simple while exact deeds remain discoverable by machine;
 * Awtsmoos.com teaches publication, files, browser, command, and web work without exposing every inner engine.
 */

const CATALOG_URL = "https://awtsmoos.com/api/tunnel/control/agent-manifest";

function operationCatalog() {
	return {
		files: [
			entry("list", ["p"], { p: "." }, "List one folder."),
			entry("tree", ["p"], { p: ".", depth: 2, limit: 150 }, "Inspect a bounded tree."),
			entry("read", ["p"], { p: "<discovered-file>" }, "Read one discovered file."),
			entry("write", ["p", "content"], { p: "site/index.html", content: "..." }, "Write one complete file.")
		],
		web: [
			entry(
				"publishWebsite",
				["path"],
				{ path: "asdf/sites/my-site", name: "My Site" },
				"Publish an owned alias folder to /web/<source-alias>/<slug>/ and return a verified receipt."
			),
			entry(
				"publicRootPublishFolder",
				["path", "publicPath"],
				{ path: "asdf/sites/game", publicPath: "games/game", entryFile: "index.html", verify: true },
				"Publish to one deliberate stable public-root path."
			),
			entry("httpRequest", ["url"], { url: "https://example.com", method: "GET" }, "Run or model one HTTP request through network support.")
		],
		browser: [
			entry("chromeNavigate", ["url"], { url: "https://awtsmoos.com", chromeTargetId: "<optional-target>" }, "Navigate one Chrome page."),
			entry("chromeClick", ["selector"], { selector: "#startButton", chromeTargetId: "<optional-target>" }, "Click one element.")
		],
		command: [
			entry("commandRun", ["command"], { command: "node --test test/example.test.cjs", cwd: "." }, "Run a bounded foreground command through durable job custody.")
		],
		status: [
			entry("agentDoctor", [], {}, "Inspect agent/tunnel health."),
			entry("commandJobStatus", ["jobId"], { jobId: "<job-id>" }, "Observe a durable command job.")
		]
	};
}

function compactExamples() {
	return [
		{ action: "files", operation: "list", params: { p: "." } },
		{ action: "files", operation: "tree", params: { p: ".", depth: 2, limit: 150 } },
		{ action: "web", operation: "publishWebsite", params: { path: "asdf/sites/my-site", name: "My Site" } }
	];
}

function entry(operation, required, example, description) {
	return {
		operation,
		required,
		example,
		description
	};
}

module.exports = {
	CATALOG_URL,
	compactExamples,
	operationCatalog
};
