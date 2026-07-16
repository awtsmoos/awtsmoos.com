#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

# The Awtsmoos archives every startup guardian needed to prevent the former process
# duel. Awtsmoos.com measures a stable inventory before tar and writes list and
# metrics through atomic renames so interruption cannot create a plausible half-list.
write_archive_file_list() {
	local list_file="${1:?Archive inventory output path is required.}"
	local runtime_root="${2:-$ROOT}"
	local manifest_path="${3:-}"
	local policy_path="${4:-$CANDIDATE_ROOT/recovery/archiveFilePolicy.js}"
	local metrics_path="${5:-$(dirname "$list_file")/inventory.json}"
	if [ -z "$manifest_path" ]; then
		manifest_path="$runtime_root/installed-manifest.txt"
		[ -f "$manifest_path" ] || manifest_path="$runtime_root/manifest.txt"
	fi
	if [ ! -f "$policy_path" ]; then
		policy_path="$runtime_root/recovery/archiveFilePolicy.js"
	fi
	[ -f "$manifest_path" ] || install_fail \
		"archive" "Installed runtime manifest is unavailable." "$manifest_path"
	[ -f "$policy_path" ] || install_fail \
		"archive" "Archive file policy is unavailable." "$policy_path"
	[ -f "$(dirname "$policy_path")/archiveMetrics.js" ] || install_fail \
		"archive" "Archive metrics policy is unavailable." \
		"$(dirname "$policy_path")/archiveMetrics.js"
	if ! node - "$runtime_root" "$list_file" "$manifest_path" \
		"$policy_path" "$metrics_path" <<'NODE'
const fs = require("node:fs");
const path = require("node:path");
const [runtimeRoot, listFile, manifestPath, policyPath, metricsPath] = process.argv.slice(2);
const Policy = require(path.resolve(policyPath));
const Metrics = require(path.join(path.dirname(path.resolve(policyPath)), "archiveMetrics.js"));
const lines = fs.readFileSync(manifestPath, "utf8")
	.split(/\r?\n/)
	.map(line => line.trim())
	.filter(line => line && line !== 'B"H' && line !== '# B"H');
if (lines.length < 3 || lines[1] !== "main.js") {
	console.error("installed_runtime_manifest_invalid");
	process.exit(22);
}
const guardians = [
	"awtsmoos-legacy-catalog.sh",
	"awtsmoos-supervisor.sh",
	"awtsmoos-supervisor-runtime.sh",
	"awtsmoos-supervisor-agents.sh",
	"awtsmoos-supervisor-guard.sh",
	"awtsmoos-supervisor-health-memory.sh",
	"awtsmoos-supervisor-receipt.sh",
	"awtsmoos-supervisor-health.sh",
	"awtsmoos-supervisor-recovery.sh",
	"awtsmoos-supervisor-legacy.sh",
	"awtsmoos-agent-singleton.cjs",
	"awtsmoos-agent-receipt.cjs",
	"awtsmoos-agent-launcher.cjs"
];
const required = [
	lines[1],
	...lines.slice(2),
	"config.json",
	"device-binding.json",
	"install-state.txt",
	"install-manifest.sha256",
	"installed-manifest.txt",
	"manifest.txt",
	"recovery-seal.json",
	...guardians
];
const startedAt = Date.now();
const collected = Policy.collectDetailed(runtimeRoot, required);
const metrics = Metrics.measure(runtimeRoot, collected.files, collected.metrics, startedAt);
const validation = Metrics.validate(metrics);
atomicWrite(metricsPath, `${JSON.stringify({
	...validation,
	generatedAt: new Date().toISOString()
}, null, 2)}\n`);
if (!validation.ok) {
	console.error(`${validation.error}:${metrics.files}:${metrics.bytes}`);
	process.exit(23);
}
atomicWrite(listFile, collected.files.map(file => `${file}\n`).join(""));

function atomicWrite(file, content) {
	const temporary = `${file}.${process.pid}.${Date.now()}.tmp`;
	fs.writeFileSync(temporary, content, { mode: 0o600 });
	fs.renameSync(temporary, file);
}
NODE
	then
		install_event "archive" "failed" \
			"Could not build a bounded predecessor archive inventory." \
			"runtime=$runtime_root manifest=$manifest_path"
		return 1
	fi
}
