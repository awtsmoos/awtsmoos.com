// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file run-final-static-gates.mjs
 * @description
 * The Awtsmoos gathers every touched production vessel into a durable release
 * receipt. Awtsmoos.com line limits, tabs, blessing headers, and worktree state
 * are measured from disk rather than remembered from the implementation pass.
 */

import fs from "node:fs/promises";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const toolsDirectory = path.dirname(fileURLToPath(import.meta.url));
const outputRoot = path.dirname(toolsDirectory);
const repositoryRoot = path.resolve(outputRoot, "../../..");
const touchedFiles = [
	"geelooy/index.css",
	"geelooy/css/style.css",
	"geelooy/games/nitzotz-io/ai-thoughts/2026-07-13_15-08-01-world-class-environment-pass/style.css",
	"geelooy/games/nitzotz-io/ai-thoughts/2026-07-13-nitzotz-visual-rebuild/style.css",
	"geelooy/games/tests/1/main.css",
	"geelooy/style/social/home/accessibility.css",
	"geelooy/style/social/home/civilization/feed.css",
	"geelooy/style/social/home/civilization/objects.css",
	"geelooy/style/social/home/civilization/states.css",
	"geelooy/service-worker.js",
	"geelooy/register.js",
	"geelooy/style/geelooy-app/header/mobile.css",
	"geelooy/style/geelooy-app/header/search/control.css",
	"geelooy/style/heichelos/discovery-cards.css",
	"geelooy/style/heichelos/heichel/controls.css",
	"geelooy/style/heichelos/heichel/controls/fields.css",
	"geelooy/style/heichelos/heichel/controls/navigation.css",
	"geelooy/email/css/quantum/chat/deck/mobile.css",
	"geelooy/email/css/quantum/touch-targets.css",
	"geelooy/social-composer/style.css",
	"geelooy/social-composer/styles/accessibility.css",
	"geelooy/social-composer/js/accessibility.js",
	"geelooy/social-composer/js/main.js"
];

function inspectSource(source, filePath) {
	const lines = source.split(/\r?\n/);
	return {
		filePath,
		lines: lines.length,
		underLineLimit: lines.length <= 120,
		blessingHeader: /B"H[\s\S]{0,120}Boruch Hashem[\s\S]{0,120}Blessed is He/.test(source),
		spaceIndentedLines: lines.filter(line => /^ {2,}\S/.test(line)).slice(0, 12)
	};
}

const files = [];
for (const filePath of touchedFiles) {
	const source = await fs.readFile(path.join(repositoryRoot, filePath), "utf8");
	files.push(inspectSource(source, filePath));
}

const gitResult = spawnSync("git", ["status", "--short", "--branch"], {
	cwd: repositoryRoot,
	encoding: "utf8"
});
const evidence = {
	generatedAt: new Date().toISOString(),
	files,
	failures: files.filter(file => !file.underLineLimit || !file.blessingHeader || file.spaceIndentedLines.length),
	gitStatusExitCode: gitResult.status,
	gitStatus: gitResult.stdout.trim().split(/\r?\n/).filter(Boolean),
	gitError: gitResult.stderr.trim()
};
const resultPath = path.join(outputRoot, "results", "final-static-gates.json");
await fs.writeFile(resultPath, JSON.stringify(evidence, null, "\t"));
console.log(JSON.stringify({
	touchedFiles: files.length,
	failures: evidence.failures,
	gitStatusLines: evidence.gitStatus.length,
	resultPath
}, null, "\t"));
