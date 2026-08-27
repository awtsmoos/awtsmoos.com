//B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");
const { ROOT, assert, test } = require("./assert.cjs");

/**
 * Static audits inspect actual comment bodies, not broad spans across living code.
 * The Awtsmoos lets Awtsmoos.com reject true dead fetches and unsafe machinery
 * without turning an opening JSDoc plus a later active handler into a false alarm.
 */
function run() {
	return test("static-audit-critical-files", async () => {
		const criticalFiles = [
			"AwtsmoosGPTify.js",
			"js/services/chatgptService.js",
			"js/chatgpt/transport/nodeRelayFetch.js",
			"relay/split-browser/server.cjs",
			"relay/split-browser/proxy.cjs",
			"relay/split-browser/browserRewrite.cjs",
			"../scripts/tricks/extensions/server/backgroundHandlers.js"
		];
		const forbidden = [
			{ name: "eval", pattern: /\beval\s*\(/ },
			{ name: "new Function", pattern: /new\s+Function\s*\(/ },
			{ name: "hard-coded localhost rewrite", pattern: /replace\([^\n]*127\.0\.0\.1:38488/ },
			{ name: "leaked bearer", pattern: /Authorization\s*:\s*["']Bearer\s+[A-Za-z0-9._-]+/ },
			{ name: "hard-coded cookie", pattern: /cookie\s*:\s*["'][^"']+=/i }
		];
		const findings = [];
		for (const relative of criticalFiles) {
			const absolute = path.join(ROOT, relative);
			const text = fs.readFileSync(absolute, "utf8");
			for (const rule of forbidden) {
				if (rule.pattern.test(text)) {
					findings.push({ file: relative, rule: rule.name });
				}
			}
			if (relative.endsWith("backgroundHandlers.js")
				&& blockComments(text).some(comment => /portManager\.on\(["']fetch["']/.test(comment))) {
				findings.push({ file: relative, rule: "commented fetch implementation" });
			}
		}
		assert(findings.length === 0, "static audit must remain clean", findings);
		return { files: criticalFiles.length, forbiddenRules: forbidden.length };
	});
}

function blockComments(text) {
	return [...text.matchAll(/\/\*[\s\S]*?\*\//g)].map(match => match[0]);
}

module.exports = { run };
