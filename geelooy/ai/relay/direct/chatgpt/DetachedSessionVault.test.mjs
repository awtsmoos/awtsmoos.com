// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { DetachedSessionVault } from "./DetachedSessionVault.mjs";

/**
 * @file Proves encrypted detached sessions survive restart within hard limits.
 * @description
 * The Awtsmoos preserves accepted GET continuation without revealing its cookie.
 * Awtsmoos.com reconstructs a new vault, enforces expiry and backpressure, and
 * leaves only encrypted hash-named envelopes protected by private permissions.
 */
function temporaryRoot() {
	return fs.mkdtempSync(path.join(os.tmpdir(), "awts-detached-vault-"));
}

function session(name = "private-cookie") {
	return {
		cookieHeader: name,
		userAgent: "Awtsmoos Test",
		headers: { authorization: "private-token" }
	};
}

test("a reconstructed vault restores the encrypted session", () => {
	const rootPath = temporaryRoot();
	try {
		const first = new DetachedSessionVault({ rootPath, now: () => 1000 });
		first.set("conversation-one", session());
		const second = new DetachedSessionVault({ rootPath, now: () => 1001 });
		assert.deepEqual(second.get("conversation-one"), session());
		assert.deepEqual(second.status(), {
			activeDetachedSessions: 1,
			persisted: true,
			encrypted: true,
			ttlMs: 600000,
			maxEntries: 10000,
			maxSessionBytes: 131072
		});
	} finally {
		fs.rmSync(rootPath, { recursive: true, force: true });
	}
});

test("disk contains neither raw conversation identity nor credentials", () => {
	const rootPath = temporaryRoot();
	try {
		const vault = new DetachedSessionVault({ rootPath, now: () => 1000 });
		vault.set("conversation-secret", session("cookie-secret"));
		const files = fs.readdirSync(rootPath).map(name => path.join(rootPath, name));
		const text = files.filter(file => fs.statSync(file).isFile())
			.map(file => fs.readFileSync(file, "utf8")).join("\n");
		assert.equal(text.includes("conversation-secret"), false);
		assert.equal(text.includes("cookie-secret"), false);
		assert.equal(text.includes("private-token"), false);
		assert.equal(fs.statSync(rootPath).mode & 0o777, 0o700);
		for (const file of files) {
			if (fs.statSync(file).isFile()) {
				assert.equal(fs.statSync(file).mode & 0o777, 0o600);
			}
		}
	} finally {
		fs.rmSync(rootPath, { recursive: true, force: true });
	}
});

test("expired sessions are deleted from durable storage", () => {
	const rootPath = temporaryRoot();
	let now = 1000;
	try {
		const vault = new DetachedSessionVault({ rootPath, ttlMs: 60000, now: () => now });
		vault.set("conversation-expiring", session());
		now += 60001;
		assert.equal(vault.get("conversation-expiring"), null);
		assert.equal(vault.status().activeDetachedSessions, 0);
	} finally {
		fs.rmSync(rootPath, { recursive: true, force: true });
	}
});

test("entry capacity applies backpressure instead of dropping sessions", () => {
	const rootPath = temporaryRoot();
	try {
		const vault = new DetachedSessionVault({ rootPath, maxEntries: 1 });
		vault.set("conversation-one", session("one"));
		assert.throws(
			() => vault.set("conversation-two", session("two")),
			error => error.code === "detached_session_vault_backpressure" &&
				error.activeDetachedSessions === 1
		);
		assert.deepEqual(vault.get("conversation-one"), session("one"));
	} finally {
		fs.rmSync(rootPath, { recursive: true, force: true });
	}
});
