// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const { DocsChangeService } = require("../changeService.js");
const { DocsPublicationDirectory } = require("../publicationDirectory.js");
const { DocsPublicationRepository } = require("../publicationRepository.js");
const { DocsVersionRepository } = require("../versionRepository.js");
const { MemoryDatabase } = require("./memoryDatabase.js");

/**
 * @file Verifies history endurance and publication separation for Awtsmoos Docs.
 * @description Netzach remembers, Hod broadcasts, and Gevurah revokes while the Awtsmoos
 * is beyond all three; Awtsmoos.com asks these tests to witness that frozen snapshots
 * stay frozen and living publications receive only their deliberate public projection.
 */
const DOCUMENT_ID = "doc_123456789012";

/** Creates one representative semantic document without sharing credentials in public projections. */
function documentFixture(title = "First light") {
	return {
		id: DOCUMENT_ID,
		title,
		revision: 3,
		blocks: [{ id: "block_1", tag: "p", html: `<strong>${title}</strong>`, style: {} }],
		layout: { mode: "page" },
		comments: [{ id: "private_note", text: "Never publish me" }],
		access: { mode: "link-edit", linkToken: "secret" },
		updatedAt: "2026-08-21T05:00:00.000Z"
	};
}

test("named versions retain restorable document state without access credentials", async () => {
	const versions = new DocsVersionRepository(new MemoryDatabase());
	const version = await versions.create(documentFixture(), {
		kind: "named",
		label: "Before launch",
		author: "Writer"
	});
	const loaded = await versions.get(DOCUMENT_ID, version.id);
	assert.equal(loaded.label, "Before launch");
	assert.equal(loaded.snapshot.comments.length, 1);
	assert.equal("access" in loaded.snapshot, false);
});

test("snapshot publication remains immutable after the mutable source changes", async () => {
	const publications = new DocsPublicationRepository(new MemoryDatabase());
	const source = documentFixture();
	const publication = await publications.create(source, "snapshot");
	source.title = "Second light";
	source.blocks[0].html = "mutated";
	const loaded = await publications.get(publication.id);
	assert.equal(loaded.snapshot.title, "First light");
	assert.match(loaded.snapshot.blocks[0].html, /First light/);
	assert.equal("comments" in loaded.snapshot, false);
	assert.equal("access" in loaded.snapshot, false);
});

test("live publication stores identity without freezing a snapshot and can be revoked", async () => {
	const publications = new DocsPublicationRepository(new MemoryDatabase());
	const publication = await publications.create(documentFixture(), "live");
	assert.equal(publication.snapshot, null);
	const revoked = await publications.revoke(publication.id);
	assert.ok(revoked.revokedAt);
	const listed = await publications.list(DOCUMENT_ID);
	assert.equal(listed[0].revokedAt, revoked.revokedAt);
});

test("live viewer rooms receive sanitized updates and are evicted on revocation", () => {
	const directory = new DocsPublicationDirectory();
	const publication = { id: "p_live_test_12345678901234567890", documentId: DOCUMENT_ID };
	const viewer = { id: "viewer" };
	const events = [];
	directory.join(viewer, publication);
	const changes = new DocsChangeService(null, null, directory);
	const context = {
		sendEvent(client, type, payload) {
			events.push({ client, type, payload });
		}
	};
	changes.broadcastDocument(context, documentFixture("Live light"));
	assert.equal(events.length, 1);
	assert.equal(events[0].payload.document.title, "Live light");
	assert.equal("comments" in events[0].payload.document, false);
	directory.revoke(context, publication.id);
	assert.equal(events.length, 2);
	assert.equal(directory.roomsForDocument(DOCUMENT_ID).length, 0);
});
