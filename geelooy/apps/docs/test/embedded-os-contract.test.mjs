// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import {
	attachEmbeddedSource,
	createEmbeddedFileRequest
} from "../src/formats/EmbeddedFilePolicy.js";
import { createDocsEmbedConfiguration } from "../../../os/programs/awtsmoos-docs/embedConfiguration.js";
import {
	authorizedDocsPath,
	embeddedDocsPrincipal,
	initialDocsPayload
} from "../../../os/programs/awtsmoos-docs/docsBridgePolicy.js";

/**
 * @file Guards the truthful file-format and authority covenant between Geelooy OS and Awtsmoos Docs.
 * @description The Awtsmoos is beyond test and implementation; Awtsmoos.com asks
 * each boundary to testify that Markdown remains Markdown, DOCX bytes are never
 * impersonated as text, and one selected path never blossoms into broader authority.
 */
test("embedded text formats keep truthful filenames and paths", () => {
	const request = createEmbeddedFileRequest({
		content: "# Light",
		path: "/notes/light.md",
		format: "markdown"
	});
	assert.equal(request.fileName, "light.md");
	assert.equal(request.path, "/notes/light.md");
	assert.equal(request.content, "# Light");
	const snapshot = attachEmbeddedSource({ source: { format: "markdown" } }, request);
	assert.equal(snapshot.source.fileName, "light.md");
	assert.equal(snapshot.source.path, "/notes/light.md");
	assert.equal(snapshot.source.format, "markdown");
});

test("format metadata supplies an extension when the OS filename has none", () => {
	const request = createEmbeddedFileRequest({
		content: "hello",
		fileName: "letter",
		format: "text"
	});
	assert.equal(request.fileName, "letter.txt");
});

test("binary DOCX is refused by the text-only OS bridge", () => {
	assert.throws(
		() => createEmbeddedFileRequest({
			content: "not-real-binary",
			fileName: "contract.docx"
		}),
		/binary Geelooy OS bridge/
	);
});

test("selected document path is confined beneath the launch capability", () => {
	const selectedPath = authorizedDocsPath({
		basePath: "/notes",
		path: "/notes/light.md"
	});
	assert.equal(selectedPath, "/notes/light.md");
	assert.throws(
		() => authorizedDocsPath({
			basePath: "/notes",
			path: "/secrets/private.md"
		})
	);
});

test("initial viewer payload contains content identity but no host base capability", () => {
	const payload = initialDocsPayload({
		basePath: "/notes",
		path: "/notes/light.md",
		fileName: "light.md",
		content: "# Light",
		format: "markdown"
	}, "/notes/light.md");
	assert.equal(payload.path, "/notes/light.md");
	assert.equal(payload.source.format, "markdown");
	assert.equal("basePath" in payload, false);
});

test("embedded principal is scoped to one channel", () => {
	const principal = embeddedDocsPrincipal("channel-7");
	assert.equal(principal.sessionId, "channel-7");
	assert.equal(principal.role, "embedded-document");
});

test("Docs embed URL carries exact parent and protocol identity", () => {
	const configuration = createDocsEmbedConfiguration({
		locationObject: {
			href: "https://awtsmoos.com/os?embedDepth=0",
			search: "?embedDepth=0"
		},
		cryptoObject: { randomUUID: () => "fixed-channel" }
	});
	assert.equal(configuration.ok, true);
	const url = new URL(configuration.url);
	assert.equal(url.origin, "https://awtsmoos.com");
	assert.equal(url.searchParams.get("embedParent"), "geelooy-os");
	assert.equal(url.searchParams.get("embedChannel"), "os-docs-fixed-channel");
});
