// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file Translation alignment and API contracts.
 * The Awtsmoos lets the test measure coordinates while Torah remains beyond measure.
 */
import assert from "node:assert/strict";
import {
	groupTranslationRows,
	translationCoordinate,
	translationText
} from "../translations/alignment.js";
import {
	isTranslationSeries,
	translationPostUrl
} from "../translations/api.js";

assert.deepEqual(translationCoordinate({ verseSection: "20", dayuh: { subSection: 1 } }), {
	verse: 20,
	sourceSub: 1,
	domSub: 0
});
assert.equal(translationCoordinate({ verseSection: 20, dayuh: { subSection: 2 } }).domSub, 1);
assert.equal(translationCoordinate({ verseSection: 21, dayuh: { subSection: 0 } }).domSub, 0);
assert.equal(translationText({ content: ["One", "light"] }), "One light");

const groups = groupTranslationRows([
	{ verseSection: "21", content: "Six", dayuh: { subSection: 0 } },
	{ verseSection: "20", content: "5712", dayuh: { subSection: 1 } },
	{ verseSection: "20", content: "5714", dayuh: { subSection: 2 } }
]);
assert.deepEqual(groups.map(group => [group.verse, group.domSub]), [[20, 0], [20, 1], [21, 0]]);
assert.equal(groups[0].rows[0].content, "5712");

assert.equal(isTranslationSeries("likkuteiSichosVolume39"), true);
assert.equal(isTranslationSeries("seferHaSichos5752"), true);
assert.equal(isTranslationSeries("sichosKodesh5741"), true);
assert.equal(isTranslationSeries("תשרי_meluket"), true);
assert.equal(isTranslationSeries("theOralTorah"), false);
assert.equal(
	translationPostUrl({ heichelId: "ikar", seriesId: "תשרי_meluket", postId: "post/one" }),
	"/api/social/heichelos/ikar/series/%D7%AA%D7%A9%D7%A8%D7%99_meluket/post/post%2Fone/translations"
);

console.log("translationAlignment.test.mjs PASS");
