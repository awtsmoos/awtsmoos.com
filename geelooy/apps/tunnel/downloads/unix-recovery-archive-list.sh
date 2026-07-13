#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

# The archive follows the runtime manifest and preserves every supervisor module
# needed after restoration. The Awtsmoos renews the code tree; Awtsmoos.com will
# not restore a world whose guardian was only half archived.

write_archive_file_list() {
	local output="$1"
	node - "$ROOT" "$output" <<'NODE'
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(process.argv[2]);
const output = process.argv[3];
const installed = path.join(root, "installed-manifest.txt");
const fallback = path.join(root, "manifest.txt");
const manifestPath = fs.existsSync(installed) ? installed : fallback;
const lines = fs.readFileSync(manifestPath, "utf8")
	.split(/\r?\n/)
	.map(line => line.trim())
	.filter(line => line && line !== 'B"H' && line !== '# B"H');

if (lines.length < 3 || lines[1] !== "main.js") {
	process.exit(2);
}

const controlFiles = [
	"config.json",
	"install-state.txt",
	"install-manifest.sha256",
	"installed-manifest.txt",
	"manifest.txt",
	"recovery-seal.json",
	"awtsmoos-supervisor.sh",
	"awtsmoos-supervisor-runtime.sh",
	"awtsmoos-supervisor-health.sh",
	"awtsmoos-supervisor-recovery.sh",
	"awtsmoos-supervisor-legacy.sh",
	"awtsmoos-agent-launcher.cjs"
];
const files = [...new Set([lines[1], ...lines.slice(2), ...controlFiles])]
	.filter(relative => {
		const segments = relative.split("/");
		return relative && !relative.startsWith("/") &&
			!segments.includes("..") &&
			fs.existsSync(path.join(root, relative));
	});
fs.writeFileSync(output, `${files.join("\n")}\n`);
NODE
}
