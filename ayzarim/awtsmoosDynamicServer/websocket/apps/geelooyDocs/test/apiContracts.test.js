// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const { handleCapabilityRequest } = require("../capabilityHandlers.js");
const { documentConflict } = require("../docsErrors.js");
const { DocsPublicationDirectory } = require("../publicationDirectory.js");
const { DocsPublicationRepository } = require("../publicationRepository.js");
const { publicationMode } = require("../publicationPolicy.js");
const { openPublication } = require("../publicationViewerHandlers.js");
const { read } = require("../storageHelpers.js");
const { MemoryDatabase } = require("./memoryDatabase.js");

/**
 * @file Verifies machine-readable failure and capability contracts for Awtsmoos Docs.
 * @description The Awtsmoos is beyond success and refusal; Awtsmoos.com asks failure
 * itself to testify with code, status, and actionable detail so realistic clients can
 * recover without scraping English prose or confusing disappearance with infrastructure.
 */
const DOCUMENT = Object.freeze({
	id: "doc_123456789012",
	title: "API light",
	revision: 2,
	blocks: [{ id: "block_1", tag: "p", html: "Light", style: {} }],
	layout: { mode: "page" },
	comments: [],
	access: { mode: "private" }
});

test("capabilities expose actual format and transport boundaries", () => {
	const response = handleCapabilityRequest(null, null, null, {
		type: "docs.capabilities.get"
	});
	const capabilities = response.payload.capabilities;
	assert.equal(capabilities.apiVersion, 1);
	assert.equal(capabilities.embed.binaryTransport, false);
	assert.ok(capabilities.formats.importBinary.includes("docx"));
	assert.ok(!capabilities.embed.osTextFormats.includes("docx"));
	assert.equal(capabilities.document.headingLevels, 6);
});

test("invalid publication mode is a client-fixable 400", () => {
	assert.throws(
		() => publicationMode("broadcast"),
		error => error.code === "DOCS_INVALID_INPUT" && error.status === 400
	);
});

test("block conflicts carry both client and server revisions", () => {
	const error = documentConflict({
		blockId: "block_1",
		clientRevision: 3,
		serverRevision: 7
	});
	assert.equal(error.code, "DOCS_CONFLICT");
	assert.equal(error.status, 409);
	assert.deepEqual(error.details, {
		blockId: "block_1",
		clientRevision: 3,
		serverRevision: 7
	});
});

test("revoked publication opens as permanent 410", async () => {
	const publications = new DocsPublicationRepository(new MemoryDatabase());
	const publication = await publications.create(DOCUMENT, "live");
	await publications.revoke(publication.id);
	await assert.rejects(
		openPublication(
			{ get: async () => ({ document: DOCUMENT }) },
			{ client: { id: "viewer" } },
			{ publicationId: publication.id },
			{
				publications,
				publicationDirectory: new DocsPublicationDirectory()
			}
		),
		error => error.code === "DOCS_PUBLICATION_REVOKED" && error.status === 410
	);
});

test("storage outage cannot masquerade as a missing record", async () => {
	const database = {
		async get() {
			throw new Error("disk offline");
		}
	};
	await assert.rejects(
		read(database, "any/path", null),
		error => error.code === "DOCS_STORAGE_UNAVAILABLE" && error.status === 503
	);
});
