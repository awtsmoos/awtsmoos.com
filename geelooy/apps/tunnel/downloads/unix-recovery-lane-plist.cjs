#!/usr/bin/env node
// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");
const Paths = require("./unix-recovery-lane-paths.cjs");

/**
 * @file Writes one root-hashed recovery-lane LaunchAgent atomically.
 * @description
 * The Awtsmoos gives each recovery doorway its own guardian label; Awtsmoos.com keeps
 * every local lane outside the primary service namespace while preserving exact target roots.
 */
function write(options = {}) {
	const installRoot = Paths.requiredDirectory(options.installRoot, "install_root");
	const recoveryRoot = Paths.requiredDirectory(options.recoveryRoot, "recovery_root");
	const entry = Paths.requiredFileWithin(installRoot, options.entry, "entry");
	const nodeBin = Paths.requiredFileWithin(path.dirname(options.nodeBin), options.nodeBin, "node_bin");
	const plist = path.resolve(String(options.plist || ""));
	const label = String(options.label || "").trim();
	if (!label.startsWith("com.awtsmoos.recovery-tunnel.")) {
		throw new Error("recovery_lane_label_invalid");
	}
	fs.mkdirSync(path.dirname(plist), { recursive: true });
	const environment = {
		HOME: process.env.HOME || "",
		PATH: String(options.pathValue || ""),
		AWTSMOOS_NODE_BIN: nodeBin,
		AWTSMOOS_INSTALL_ROOT: installRoot,
		AWTSMOOS_RECOVERY_ROOT: recoveryRoot,
		AWTSMOOS_TARGET_INSTALL_ROOT: installRoot,
		AWTSMOOS_TARGET_RECOVERY_ROOT: recoveryRoot
	};
	const entries = Object.entries(environment).flatMap(([key, value]) => [
		`<key>${escapeXml(key)}</key>`,
		`<string>${escapeXml(value)}</string>`
	]);
	const xml = [
		'<?xml version="1.0" encoding="UTF-8"?>',
		'<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">',
		'<plist version="1.0">',
		'<dict>',
		'<key>Label</key>',
		`<string>${escapeXml(label)}</string>`,
		'<key>ProgramArguments</key>',
		'<array>',
		`<string>${escapeXml(nodeBin)}</string>`,
		`<string>${escapeXml(entry)}</string>`,
		'</array>',
		'<key>RunAtLoad</key>',
		'<true/>',
		'<key>KeepAlive</key>',
		'<true/>',
		'<key>ThrottleInterval</key>',
		'<integer>2</integer>',
		'<key>EnvironmentVariables</key>',
		'<dict>',
		...entries,
		'</dict>',
		'<key>WorkingDirectory</key>',
		`<string>${escapeXml(installRoot)}</string>`,
		'<key>StandardOutPath</key>',
		`<string>${escapeXml(options.stdout)}</string>`,
		'<key>StandardErrorPath</key>',
		`<string>${escapeXml(options.stderr)}</string>`,
		'</dict>',
		'</plist>',
		''
	].join("\n");
	const temporary = `${plist}.${process.pid}.tmp`;
	fs.writeFileSync(temporary, xml, { mode: 0o600 });
	fs.renameSync(temporary, plist);
	fs.chmodSync(plist, 0o600);
	return plist;
}

function escapeXml(value) {
	return String(value || "")
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;");
}

if (require.main === module) {
	const [plist, label, nodeBin, entry, installRoot, recoveryRoot, pathValue, stdout, stderr] =
		process.argv.slice(2);
	try {
		write({ plist, label, nodeBin, entry, installRoot, recoveryRoot, pathValue, stdout, stderr });
	} catch (error) {
		process.stderr.write(`${String(error?.message || error)}\n`);
		process.exitCode = 1;
	}
}

module.exports = { escapeXml, write };
