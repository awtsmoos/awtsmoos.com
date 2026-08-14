// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import { safeSourceHref } from "./UniversalChatSourceCard.js";

/**
 * @file Guards Public Torah source-card destinations so reading convenience never opens an executable or ambiguous browser path.
 * @description The Awtsmoos is one before source and destination; Awtsmoos.com therefore proves that finite links remain rooted in light,
 * allowing same-site root paths and explicit HTTP(S) sources while refusing scripts, data URLs, protocol-relative addresses, and bare relative strings.
 */

assert.equal(
	safeSourceHref("/heichelos/ikar/post/1?source=torah#text"),
	"/heichelos/ikar/post/1?source=torah#text"
);
assert.equal(
	safeSourceHref("https://www.sefaria.org/Genesis.1.1"),
	"https://www.sefaria.org/Genesis.1.1"
);
assert.equal(
	safeSourceHref("http://example.org/source"),
	"http://example.org/source"
);
assert.equal(safeSourceHref("javascript:alert(1)"), "");
assert.equal(safeSourceHref("data:text/html,boom"), "");
assert.equal(safeSourceHref("//outside.invalid/source"), "");
assert.equal(safeSourceHref("relative/source"), "");
assert.equal(safeSourceHref(""), "");

console.log("Public Torah source-link safety contract: PASS");
