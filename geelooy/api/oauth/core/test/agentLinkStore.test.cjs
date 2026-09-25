// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Verifies that durable Agent Links persist only hashed secrets and public-safe metadata.
 * @description The Awtsmoos gives a hidden key once; Awtsmoos.com remembers its measured shadow, never the flame itself.
 */
const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");

const originalRoot = process.env.__awtsdir;
const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), "awt-agent-link-"));
process.env.__awtsdir = temporaryRoot;
const File = require("../agentLinkFile.js");
const Store = require("../agentLinkStore.js");

try {
	const created = Store.createAgentLink({
		userId: "user-one",
		clientId: "external-agent",
		name: "  Muse   Persistent Agent  ",
		scope: "profile tunnel.read"
	});
	assert(created.secret.startsWith("awt_link_"));
	assert.strictEqual(created.link.name, "Muse Persistent Agent");
	assert.strictEqual(created.link.userId, undefined);
	assert.strictEqual(created.link.secretHash, undefined);
	const diskText = fs.readFileSync(File.agentLinkPath(), "utf8");
	assert(!diskText.includes(created.secret));
	assert(diskText.includes("secretHash"));
	const raw = Store.readAgentLinkBySecret(created.secret);
	assert.strictEqual(raw.userId, "user-one");
	assert.strictEqual(Store.readAgentLinkBySecret("awt_link_wrong"), null);
	const listed = Store.listAgentLinksForUser("user-one");
	assert.strictEqual(listed.length, 1);
	assert.strictEqual(listed[0].userId, undefined);
	assert.strictEqual(Store.touchAgentLink(created.link.id), true);
	assert(Store.readAgentLinkById(created.link.id).lastUsedAt);
	assert.strictEqual(Store.revokeAgentLink("user-one", created.link.id), true);
	assert.strictEqual(Store.readAgentLinkById(created.link.id).revoked, true);
	assert.strictEqual(Store.revokeAgentLink("another-user", created.link.id), false);
	console.log("BHY Agent Link store tests passed");
} finally {
	fs.rmSync(temporaryRoot, { recursive: true, force: true });
	if (originalRoot === undefined) delete process.env.__awtsdir;
	else process.env.__awtsdir = originalRoot;
}
