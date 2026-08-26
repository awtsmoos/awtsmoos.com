// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const IO = require("./mailbox-io.js");

/**
 * @file Proves native mailbox writes return only after exact durable readback.
 * @description
 * The Awtsmoos renews request and result as two faithful witnesses. Awtsmoos.com
 * tests that atomic replacement leaves the intended bytes, stable digest, no stray
 * temporary garment, and a directory vessel that can itself be synchronized.
 */
test("atomic mailbox write verifies exact bytes across replacement", t => {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), "awts-mailbox-durable-"));
	t.after(() => fs.rmSync(root, { recursive: true, force: true }));
	const target = path.join(root, "outbox", "request.json");
	const first = `${JSON.stringify({ id: "request", state: "accepted" })}\n`;
	const second = `${JSON.stringify({ id: "request", state: "completed", ok: true })}\n`;

	const firstWitness = IO.atomicWrite(target, first);
	assert.equal(firstWitness.bytes, Buffer.byteLength(first));
	assert.equal(firstWitness.sha256, IO.sha256(Buffer.from(first)));
	assert.equal(fs.readFileSync(target, "utf8"), first);

	const secondWitness = IO.atomicWrite(target, second);
	assert.equal(secondWitness.bytes, Buffer.byteLength(second));
	assert.equal(secondWitness.sha256, IO.sha256(Buffer.from(second)));
	assert.equal(fs.readFileSync(target, "utf8"), second);
	assert.equal(IO.syncDirectory(path.dirname(target)), true);

	const leftovers = fs.readdirSync(path.dirname(target))
		.filter((name) => name.includes(".tmp"));
	assert.deepEqual(leftovers, []);
});

test("mailbox reader refuses symbolic-link testimony", t => {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), "awts-mailbox-link-"));
	t.after(() => fs.rmSync(root, { recursive: true, force: true }));
	const source = path.join(root, "source.json");
	const link = path.join(root, "link.json");
	fs.writeFileSync(source, "{}\n");
	fs.symlinkSync(source, link);
	assert.equal(IO.read(link), null);
});
