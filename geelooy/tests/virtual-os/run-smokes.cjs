// B"H

const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "../../..");
const fixedSyntax = [
	"geelooy/scripts/awtsmoos/ui/basic.js", "geelooy/os/graph/events.js", "geelooy/os/graph/watchers.js", "geelooy/os/graph/traversal.js", "geelooy/os/graph/diff.js", "geelooy/os/graph/transaction.js", "geelooy/os/graph/registry.js", "geelooy/os/graph/osGraphSync.js",
	"geelooy/os/input/router.js", "geelooy/os/windowHandler.js", "geelooy/os/process/process.js", "geelooy/os/process/processManager.js", "geelooy/os/process/serviceRegistry.js", "geelooy/os/process/windowBinding.js", "geelooy/os/vfs/mounts.js", "geelooy/os/vfs/permissions.js", "geelooy/os/vfs/operations.js", "geelooy/os/vfs/registry.js", "geelooy/os/vfs/localVirtualAdapter.js", "geelooy/os/vfs/tunnelAdapter.js", "geelooy/os/vfs/previewAdapter.js", "geelooy/os/vfs/mutationEvents.js",
	"geelooy/os/status/osStatus.js", "geelooy/os/status/diagnosticsPopup.js", "geelooy/os/ui/toastTags.js", "geelooy/os/ui/toastCenter.js", "geelooy/os/session/localFileAccess.js", "geelooy/os/system.js", "geelooy/os/awtsmoosOs.js", "geelooy/os/contextMenuManager.js", "geelooy/os/basicPrograms.js", "geelooy/os/startMenu.js", "geelooy/os/script.js", "geelooy/scripts/awtsmoos/social/profileDropdown.js",
	"geelooy/os/tunnel/osAccess.js", "geelooy/os/tunnel/domSnapshot.js", "geelooy/os/tunnel/graphHandlers.js", "geelooy/os/tunnel/vfsHandlers.js", "geelooy/os/tunnel/desktopHandlers.js", "geelooy/os/tunnel/handlers.js", "geelooy/apps/tunnel/agent/lib/virtualOsGraph/watchers.js", "geelooy/apps/tunnel/agent/lib/virtualOsGraph/traversal.js", "geelooy/apps/tunnel/agent/lib/virtualOsGraph/diff.js", "geelooy/apps/tunnel/agent/lib/virtualOsGraph/transaction.js", "geelooy/apps/tunnel/agent/lib/virtualOsGraph/registry.js"
];
const syntaxFiles = [
	...fixedSyntax,
	...jsFiles("geelooy/os/programs/awtsmoos-command"),
	...jsFiles("geelooy/os/desktop"),
	"geelooy/os/desktopSurface.js",
	...jsFiles("geelooy/os/programs/awtsmoos-file-explorer")
];
const smokeTests = [
	"desktop-xp-smoke.mjs", "desktop-modes-shortcuts-smoke.mjs", "desktop-environment-smoke.mjs",
	"futuristic-style-unification-smoke.mjs", "style-split-smoke.mjs", "mobile-os-smoke.mjs",
	"file-explorer-interaction-smoke.mjs", "file-explorer-button-audit-smoke.mjs", "command-program-smoke.mjs",
	"code-embed-bridge-smoke.mjs", "graph-browser-smoke.mjs", "vfs-mount-smoke.mjs",
	"server-graph-smoke.cjs", "tunnel-handlers-smoke.mjs", "os-style-sequence-smoke.mjs",
	"file-explorer-icons-smoke.mjs", "file-explorer-style-smoke.mjs", "publish-local-file-smoke.mjs",
	"diagnostics-contract-smoke.mjs", "process-supervisor-smoke.mjs"
];

console.log(`B"H checking ${syntaxFiles.length} virtual OS source files`);
for (const file of [...new Set(syntaxFiles)]) run(["--check", file], `syntax:${file}`);
console.log(`B"H running ${smokeTests.length} isolated virtual OS smokes`);
for (const file of smokeTests) {
	const args = file.endsWith(".cjs")
		? [`geelooy/tests/virtual-os/${file}`]
		: ["--no-warnings", `geelooy/tests/virtual-os/${file}`];
	run(args, `smoke:${file}`);
}
console.log("B\"H virtual OS syntax and smoke suite passed");

function jsFiles(directory) {
	const absolute = path.join(repoRoot, directory);
	if (!fs.existsSync(absolute)) return [];
	return fs.readdirSync(absolute, { withFileTypes: true }).flatMap(entry => {
		const relative = path.join(directory, entry.name);
		return entry.isDirectory() ? jsFiles(relative) : entry.isFile() && entry.name.endsWith(".js") ? [relative] : [];
	});
}

function run(args, label) {
	console.log(`B"H START ${label}`);
	const startedAt = Date.now();
	const result = spawnSync(process.execPath, args, { cwd: repoRoot, stdio: "inherit", timeout: 20000 });
	if (result.error) {
		console.error(`B"H FAIL ${label}: ${result.error.message}`);
		process.exit(1);
	}
	if (result.status !== 0) {
		console.error(`B"H FAIL ${label}: exit ${result.status}`);
		process.exit(result.status || 1);
	}
	console.log(`B"H PASS ${label} ${Date.now() - startedAt}ms`);
}
