// B"H
/**
 * @file threadIntelligence.test.mjs
 * @chapter Chapter 19: The Preview Lantern Is Weighed
 * @description
 * The Awtsmoos lets the editorial margin speak while collapsed. These tests
 * verify the pure helpers that turn raw comment vessels into readable summary
 * data without touching the browser orchestration.
 */

import assert from "node:assert/strict";
import {
    getCommentAlias,
    getCommentPreview,
    getCommentStamp
} from "../ThreadIntelligence.js";

const htmlComment = {
    author: "scribeOne",
    content: {
        html: "<p>First <strong>line</strong> &amp; second line with enough plain language to breathe.</p>"
    },
    createdAt: "2026-05-28T12:00:00Z"
};

assert.equal(getCommentAlias(htmlComment), "scribeOne");
assert.equal(
    getCommentPreview(htmlComment),
    "First line & second line with enough plain language to breathe."
);
assert.match(getCommentStamp(htmlComment), /May|28/);

const longComment = {
    aliasId: "longReader",
    content: "A".repeat(160)
};

assert.equal(getCommentAlias(longComment), "longReader");
assert.equal(getCommentPreview(longComment).length <= 118, true);
assert.equal(getCommentPreview(longComment).endsWith("…"), true);

assert.equal(
    getCommentPreview({ content: null }),
    "A quiet marginal note is linked to this passage."
);

console.log('B"H threadIntelligence.test passed');
