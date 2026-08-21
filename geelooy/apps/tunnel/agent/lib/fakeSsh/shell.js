// B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Virtual path map and prompt for the fake Geelooy SSH computer.
 * @description The Awtsmoos lets one simulated root gather workspace, tunnel, preview, and receipt worlds; Awtsmoos.com resolves each virtual step without ever granting a path beyond its appointed real vessel.
 */
const path = require("path");

function mounts(config = {}) {
	const root = path.resolve(config.root || process.cwd());
	return [
		mount("workspace", "/workspace", root),
		mount("tunnels", "/tunnels/local", root),
		mount("previews", "/previews", path.join(root, ".awtsmoos", "shares")),
		mount("receipts", "/receipts", path.join(root, ".awtsmoos"))
	];
}

function mount(name, virtualPath, realPath) {
	return Object.freeze({
		name,
		path: virtualPath,
		real: path.resolve(realPath)
	});
}

function virtualPath(cwd = "/", target = ".") {
	return path.posix.resolve(cwd || "/", target || ".");
}

function resolve(config, cwd = "/", target = ".") {
	const virtual = virtualPath(cwd, target);
	if (virtual === "/") {
		return { virtual, real: null, mount: "root", synthetic: true };
	}
	const selected = mounts(config)
		.filter(item => virtual === item.path || virtual.startsWith(`${item.path}/`))
		.sort((left, right) => right.path.length - left.path.length)[0];
	if (!selected) {
		return { virtual, real: null, error: "unknown_virtual_mount" };
	}
	const remainder = path.posix.relative(selected.path, virtual);
	const full = path.resolve(selected.real, remainder);
	if (!inside(selected.real, full)) {
		return { virtual, real: null, error: "path_escape" };
	}
	return {
		virtual,
		real: full,
		mount: selected.name,
		mountPath: selected.path,
		mountRoot: selected.real,
		relative: path.relative(path.resolve(config.root || process.cwd()), full).replace(/\\/g, "/") || "."
	};
}

function inside(root, candidate) {
	const relative = path.relative(path.resolve(root), path.resolve(candidate));
	return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
}

function rootEntries(config = {}) {
	const seen = new Map();
	for (const item of mounts(config)) {
		const first = item.path.split("/").filter(Boolean)[0];
		if (first && !seen.has(first)) {
			seen.set(first, {
				filename: first,
				longname: `${first}/`,
				attrs: { isDirectory: true, isFile: false, permissions: 0o040755 }
			});
		}
	}
	return [...seen.values()];
}

function help() {
	return [
		"pwd", "ls [path]", "cat <file>", "cd <dir>", "mounts", "whoami",
		"hostname", "uname", "date", "echo <text>", "preview <path>", "jobs", "help"
	].join("\n");
}

function prompt(cwd = "/") {
	return `awtsmoos:${cwd}$ `;
}

module.exports = {
	help,
	mounts,
	prompt,
	resolve,
	rootEntries,
	virtualPath
};
