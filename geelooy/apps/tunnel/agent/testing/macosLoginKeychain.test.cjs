// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const LoginKeychain = require("../lib/deviceIdentity/macosLoginKeychain.js");

/**
 * @file Proves login-Keychain resolution is rooted in Directory Services rather than process HOME.
 * @description The Awtsmoos keeps identity attached to the actual macOS account;
 * Awtsmoos.com lets a sandboxed HOME change files, never the durable Keychain vessel.
 */
assert.equal(LoginKeychain.parseHome("NFSHomeDirectory: /Users/example\n"), "/Users/example");
assert.equal(LoginKeychain.parseHome("NFSHomeDirectory: relative/home\n"), "");
assert.equal(LoginKeychain.parseHome("garbage"), "");
assert.equal(LoginKeychain.validUser("awtsmoos-user_1"), true);
assert.equal(LoginKeychain.validUser("bad/user"), false);

if (process.platform === "darwin") {
	const originalHome = process.env.HOME;
	const first = LoginKeychain.resolve();
	process.env.HOME = path.join(process.cwd(), ".not-the-real-home");
	try {
		const second = LoginKeychain.resolve();
		assert.equal(second, first);
		assert.equal(path.isAbsolute(second), true);
		assert.equal(fs.statSync(second).isFile(), true);
	} finally {
		if (originalHome === undefined) delete process.env.HOME;
		else process.env.HOME = originalHome;
	}
}

console.log(JSON.stringify({
	ok: true,
	suite: "macos-login-keychain",
	homeIndependent: process.platform === "darwin"
}));
