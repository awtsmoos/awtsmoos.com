// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const IO = require("../lib/connection-vessel/mailbox-io.js");
const Store = require("../lib/connection-vessel/mailbox-store.js");
const Mailbox = require("../lib/connection-vessel/mailbox.js");

/**
 * @file Proves mailbox write/verify/remove survive the handoff race without throwing.
 * @description
 * The Awtsmoos may settle a deed on one vessel while another still writes its
 * testimony. Awtsmoos.com treats an artifact that vanishes between check and act as
 * an expected already-gone outcome: verification, removal, and the store paths that
 * call them never raise an uncaught ENOENT, and the connection runtime stays up.
 */
const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), "awts-mailbox-race-"));
const config = {
	deviceStateRoot: path.join(sandbox, "state"),
	root: path.join(sandbox, "project"),
	tunnelName: "awt-mailbox-race-test"
};
const storeConfig = {
	deviceStateRoot: path.join(sandbox, "state-store"),
	root: path.join(sandbox, "project-store"),
	tunnelName: "awt-mailbox-race-store-test"
};
const uncaught = [];
process.on("uncaughtException", error => uncaught.push(error));

/**
 * Arms a deterministic one-shot handoff race: the next readFileSync against the
 * given lane directory first unlinks the target from "another handle", so the
 * readback inside verify() hits the exact ENOENT the old runtime died on.
 */
function armHandoffRace(laneSegment) {
	const original = fs.readFileSync;
	let armed = true;
	fs.readFileSync = function (file, ...rest) {
		if (armed && String(file).includes(laneSegment)) {
			armed = false;
			fs.unlinkSync(String(file));
		}
		return original.call(this, file, ...rest);
	};
	return () => {
		fs.readFileSync = original;
	};
}

try {
	fs.mkdirSync(config.root, { recursive: true });
	fs.mkdirSync(storeConfig.root, { recursive: true });

	// 1. verify() on a never-existent artifact is benign, not a throw.
	const missing = path.join(sandbox, "inbox", "never-written.json");
	const neverExisted = IO.verify(missing, Buffer.from("x"));
	assert.equal(neverExisted.vanished, true);
	assert.equal(neverExisted.bytes, 0);
	assert.equal(neverExisted.sha256, null);
	assert.equal(neverExisted.path, missing);

	// 2. The exact crash race: write, delete from another handle, then verify.
	const raced = path.join(sandbox, "inbox", "raced.json");
	const written = IO.atomicWrite(raced, "raced testimony");
	assert.equal(written.vanished, undefined);
	assert.ok(written.sha256);
	fs.unlinkSync(raced); // handoff cleanup wins the race
	const afterRace = IO.verify(raced, Buffer.from("raced testimony"));
	assert.equal(afterRace.vanished, true);
	assert.equal(afterRace.bytes, 0);

	// 3. remove() is idempotent: gone twice is still benign.
	const removable = path.join(sandbox, "inbox", "removable.json");
	IO.atomicWrite(removable, "temporary");
	assert.deepEqual(IO.remove(removable), { path: removable, removed: true });
	assert.deepEqual(IO.remove(removable), { path: removable, removed: false, gone: true });
	assert.deepEqual(IO.remove(missing), { path: missing, removed: false, gone: true });

	// 4. store.put() survives the race mid-verification: no throw, benign result,
	//    and no phantom bytes/count recorded for the vanished artifact.
	const store = Store.createStore(storeConfig, {});
	const disarm = armHandoffRace(`${path.sep}inbox${path.sep}`);
	let racedPut;
	assert.doesNotThrow(() => {
		racedPut = store.put("inbox", "race-one", { action: "read" });
	});
	disarm();
	assert.equal(racedPut.vanished, true);
	assert.equal(racedPut.id, "race-one");
	const usageAfterRace = store.usage("inbox", true);
	assert.equal(usageAfterRace.count, 0);
	assert.equal(usageAfterRace.bytes, 0);

	// 5. store.remove() on the already-gone artifact stays benign.
	assert.equal(store.remove("inbox", "race-one"), false);

	// 6. Happy path regression: normal write verifies, reads back, removes.
	const kept = store.put("inbox", "kept-one", { action: "read" });
	assert.equal(kept.vanished, undefined);
	assert.equal(store.get("inbox", "kept-one").value.action, "read");
	assert.equal(store.remove("inbox", "kept-one"), true);
	assert.equal(store.remove("inbox", "kept-one"), false);

	// 7. The full crash stack path (mailbox-writer -> store -> verify) stays up.
	const mailbox = Mailbox.createMailbox(config, { childIncarnationId: "race-child" });
	const disarmWriter = armHandoffRace(`${path.sep}inbox${path.sep}`);
	let writerId;
	assert.doesNotThrow(() => {
		writerId = mailbox.putInbox({ id: "race-inbox", action: "read" });
	});
	disarmWriter();
	assert.equal(writerId, "race-inbox");

	// 8. Double settlement is idempotent: acknowledge of absent ids is benign.
	assert.deepEqual(mailbox.acknowledge("race-inbox"), { inbox: false, outbox: false });
	assert.deepEqual(mailbox.acknowledge("race-inbox"), { inbox: false, outbox: false });

	// 9. The runtime kept breathing: a normal put/get/remove still works after
	//    every race above, and no uncaught exception ever escaped.
	const alive = mailbox.putInbox({ id: "still-alive", action: "read" });
	assert.equal(alive, "still-alive");
	assert.equal(mailbox.inbox()[0].id, "still-alive");
	assert.deepEqual(mailbox.acknowledge("still-alive"), { inbox: true, outbox: false });
	assert.equal(uncaught.length, 0);

	console.log(JSON.stringify({
		ok: true,
		suite: "mailbox-race-safety",
		verifyBenignOnAbsent: true,
		removeIdempotent: true,
		storePutRaceSurvived: true,
		writerPathSurvived: true,
		runtimeStayedUp: true,
		uncaughtExceptions: uncaught.length
	}, null, 2));
} finally {
	fs.readFileSync = require("node:fs").readFileSync;
	fs.rmSync(sandbox, { recursive: true, force: true });
}
