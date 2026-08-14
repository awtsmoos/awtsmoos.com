// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file Translation reader source contract.
 * The Awtsmoos keeps English in its own safe river after Torah has manifested.
 */
import assert from "node:assert/strict";
import fs from "node:fs";

const bootstrap = fs.readFileSync(new URL("../logic/initialization/bootstrap.js", import.meta.url), "utf8");
const controller = fs.readFileSync(new URL("../translations/controller.js", import.meta.url), "utf8");
const api = fs.readFileSync(new URL("../translations/api.js", import.meta.url), "utf8");
const styles = fs.readFileSync(new URL("../styles/main.css", import.meta.url), "utf8");

const manifestIndex = bootstrap.lastIndexOf("manifestPost(viewport, post, series, pIdx)");
const translationIndex = bootstrap.lastIndexOf("beginTranslation(viewport, post, series, hId)");
const discussionIndex = bootstrap.lastIndexOf("beginDiscussion(viewport)");
assert.ok(manifestIndex >= 0, "reader must manifest original post");
assert.ok(translationIndex > manifestIndex, "translation begins after original manifestation");
assert.ok(discussionIndex > translationIndex, "discussion begins after translation hook is scheduled");
assert.match(controller, /fetchPostTranslations/);
assert.match(api, /\/translations`/);
assert.doesNotMatch(api, /comments\/|comment-tree|comments\/aliases/);
assert.match(styles, /translations\.css/);

console.log("translationReaderContract.test.mjs PASS");
