// B"H
/**
 * Chapter 277 test: the reader must never eat its own past.
 *
 * This static contract watches every high-risk reader scroll vessel. It strips
 * comments and then searches executable code for DOM destruction patterns that
 * would erase revealed chunks or subsections. Class cleanup is allowed; node
 * destruction is not.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const FILES = [
    "geelooy/heichelos/post/logic/scribe.js",
    "geelooy/heichelos/post/logic/scribe/SubsectionVirtualizer.js",
    "geelooy/heichelos/post/logic/scribe/VirtualScrollCoordinates.js",
    "geelooy/heichelos/post/logic/scribe/VirtualScrollMath.js",
    "geelooy/heichelos/post/logic/scribe/VirtualScrollOracle.js",
    "geelooy/heichelos/post/logic/scribe/VirtualScrollTarget.js",
    "geelooy/heichelos/post/logic/scribe/VirtualScrollVisibility.js"
];

const FORBIDDEN = [
    /\.replaceChildren\s*\(/,
    /\.removeChild\s*\(/,
    /(?:chunk|section|sub|node|element|el|target|wrapper|container)\.remove\s*\(/i,
    /delete\s+[^;]*(chunk|section|subsection|window)/i,
    /function\s+unrender/i,
    /const\s+unrender/i,
    /let\s+unrender/i
];

function stripComments(source) {
    return source
        .replace(/\/\*[\s\S]*?\*\//g, "")
        .replace(/(^|[^:])\/\/.*$/gm, "$1");
}

for (const file of FILES) {
    const executable = stripComments(readFileSync(file, "utf8"));
    for (const pattern of FORBIDDEN) {
        assert.equal(pattern.test(executable), false, `${file} violates append-only scroll contract with ${pattern}`);
    }
}

console.log('B"H AppendOnlyScrollContract.test passed');
