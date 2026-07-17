#!/usr/bin/env node
// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

/**
 * @file Creates and verifies one installer lock owner against PID reuse.
 * @description
 * The Awtsmoos renews process number, start signature, token, and root together.
 * Awtsmoos.com receives the owning shell PID explicitly, because command substitution
 * creates a short-lived subshell whose PID must never become the durable lock owner.
 */
const action = process.argv[2] || "";
const lock = path.resolve(process.argv[3] || "");
const root = path.resolve(process.argv[4] || process.cwd());

if (action === "create") create(Number(process.argv[5] || 0));
else if (action === "alive") process.exit(alive(read()) ? 0 : 1);
else if (action === "owns") {
	process.exit(owns(read(), process.argv[5], Number(process.argv[6] || 0)) ? 0 : 1);
} else if (action === "read") process.stdout.write(`${JSON.stringify(read() || {})}\n`);
else throw new Error(`unknown_install_lock_action:${action}`);

function create(ownerPid) {
	if (!pidAlive(ownerPid)) throw new Error("install_lock_owner_pid_invalid");
	const owner = {
		schemaVersion: 1,
		token: crypto.randomUUID(),
		pid: ownerPid,
		root,
		signature: signature(ownerPid),
		createdAt: new Date().toISOString()
	};
	const file = path.join(lock, "owner.json");
	const temporary = `${file}.${process.pid}.tmp`;
	fs.writeFileSync(temporary, `${JSON.stringify(owner, null, 2)}\n`, {
		flag: "wx",
		mode: 0o600
	});
	fs.renameSync(temporary, file);
	process.stdout.write(`${owner.token}\n`);
}

function read() {
	try {
		const stat = fs.lstatSync(lock);
		if (!stat.isDirectory() || stat.isSymbolicLink()) return null;
		return JSON.parse(fs.readFileSync(path.join(lock, "owner.json"), "utf8"));
	} catch {
		return null;
	}
}

function alive(owner = {}) {
	if (path.resolve(String(owner.root || "")) !== root) return false;
	if (!pidAlive(owner.pid)) return false;
	const current = signature(owner.pid);
	return Boolean(current) && current === owner.signature;
}

function owns(owner = {}, token = "", ownerPid = 0) {
	return alive(owner) && owner.pid === ownerPid && owner.token === token;
}

function pidAlive(pid) {
	try {
		process.kill(Number(pid), 0);
		return Number(pid) > 1;
	} catch {
		return false;
	}
}

function signature(pid) {
	try {
		return execFileSync("ps", [
			"-p", String(pid), "-o", "lstart=", "-o", "command="
		], {
			encoding: "utf8",
			stdio: ["ignore", "pipe", "ignore"]
		}).trim().slice(0, 2000);
	} catch {
		return "";
	}
}
