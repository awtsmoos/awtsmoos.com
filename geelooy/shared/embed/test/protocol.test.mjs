//B"H
//Boruch Hashem
//Blessed is He

import assert from "assert";
import {
	createEmbedEnvelope,
	EMBED_KINDS,
	EMBED_NAMESPACE,
	EMBED_PROTOCOL_VERSION,
	normalizeEmbedError,
	validateEmbedEnvelope
} from "../protocol.js";
import { MAX_EMBED_DEPTH, nextEmbedDepth } from "../depth.js";
import { confineEmbedPath } from "../pathPolicy.js";

/**
 * B"H
 * These tests challenge identity, version, direction, depth, and path. The
 * Awtsmoos creates every boundary anew; Awtsmoos.com proves that malformed or
 * wandering requests cannot borrow the name of a trusted embedded channel.
 */

const envelope = createEmbedEnvelope({
	channelId: "channel-one",
	requestId: "request-one",
	kind: EMBED_KINDS.REQUEST,
	type: "vfs.read",
	source: "apps-code",
	target: "geelooy-os",
	payload: { path: "/desktop.folder/file.js" },
	timestamp: "2026-07-13T09:00:00.000Z"
});
assert.equal(envelope.namespace, EMBED_NAMESPACE);
assert.equal(envelope.protocolVersion, EMBED_PROTOCOL_VERSION);
assert.equal(validateEmbedEnvelope(envelope, {
	channelId: "channel-one",
	source: "apps-code",
	target: "geelooy-os",
	kind: EMBED_KINDS.REQUEST
}).ok, true);

assert.equal(validateEmbedEnvelope(null).reason, "malformed-envelope");
assert.equal(validateEmbedEnvelope({ ...envelope, namespace: "foreign" }).reason,
	"namespace-mismatch");
assert.equal(validateEmbedEnvelope({ ...envelope, protocolVersion: 99 }).reason,
	"protocol-version-mismatch");
assert.equal(validateEmbedEnvelope({ ...envelope, channelId: "wrong" }, {
	channelId: "channel-one"
}).reason, "channelId-mismatch");
assert.equal(validateEmbedEnvelope({ ...envelope, source: "wrong" }, {
	source: "apps-code"
}).reason, "source-mismatch");
assert.equal(validateEmbedEnvelope({ ...envelope, target: "wrong" }, {
	target: "geelooy-os"
}).reason, "target-mismatch");
assert.equal(validateEmbedEnvelope({ ...envelope, kind: "unknown" }).reason,
	"unsupported-envelope-kind");
assert.equal(validateEmbedEnvelope({ ...envelope, requestId: "" }).reason,
	"missing-request-id");
assert.deepEqual(normalizeEmbedError(new Error("broken")), {
	code: "Error",
	message: "broken",
	detail: {}
});

assert.equal(
	confineEmbedPath("/desktop.folder", "desktop.folder/file.js"),
	"/desktop.folder/file.js"
);
assert.equal(
	confineEmbedPath("/desktop.folder", "nested/file.js"),
	"/desktop.folder/nested/file.js"
);
assert.equal(
	confineEmbedPath("awtsmoos://host/root", "nested", "file.js"),
	"awtsmoos://host/root/nested/file.js"
);
assert.throws(
	() => confineEmbedPath("/desktop.folder", "../secret.txt"),
	/embed_path_traversal_rejected/
);
assert.throws(
	() => confineEmbedPath("/desktop.folder", "/other/file.js"),
	/embed_path_outside_base/
);
assert.equal(nextEmbedDepth("?embedDepth=0").next, 1);
assert.equal(nextEmbedDepth(`?embedDepth=${MAX_EMBED_DEPTH}`).ok, false);

console.log("BHY shared embed protocol and path tests passed");
