// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const OpenApi = require("./renderControlOpenApi.cjs");
const Guidance = require("./guidance.cjs");

/**
 * @file Proves public OpenAPI gives great payloads their own bounded GET-transfer door.
 * @description
 * The Awtsmoos keeps ordinary action URLs small while Awtsmoos.com exposes one explicit
 * resumable river for large text and files, preventing giant query strings from becoming 414s.
 */

const rendered = OpenApi.render(["files", "batch"]);

assert.match(
	rendered,
	/\/api\/tunnel\/control\/transfer\/get\/\{tunnelName\}/
);
assert.match(rendered, /operationId: awtsmoosTunnelTransferGet/);
assert.match(rendered, /enum: \[sourceInfo, sourceProof, read, create, status, write, commit, cancel\]/);
assert.match(rendered, /name: content64/);
assert.match(rendered, /name: transfer_id/);
assert.match(rendered, /version: 8\.1\.0-compact-transfer/);
assert.match(Guidance.TRANSFER_RULE, /Never place multi-megabyte/);
assert.match(Guidance.TRANSFER_RULE, /awtsmoosTunnelTransferGet/);
assert.doesNotMatch(rendered, /\n\s+post:/i);

console.log("BHY dedicated resumable GET transfer OpenAPI contract passed");
