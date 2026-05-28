// B"H
import assert from "node:assert/strict";
import { normalizeSparkDayuh, scoreInlineCoordinate } from "../coordinate.js";

const verseLevel = { id: "a", dayuh: { verseSection: 0 }, sub: 4, subSection: 4 };
const verseDayuh = normalizeSparkDayuh(verseLevel, 0);
assert.equal(verseDayuh.verseSection, 0);
assert.equal(Object.prototype.hasOwnProperty.call(verseDayuh, "subSection"), false);
assert.equal(scoreInlineCoordinate(verseLevel), 2);

const paragraphLevel = { id: "b", dayuh: { verseSection: 0, subSection: 4 } };
const paragraphDayuh = normalizeSparkDayuh(paragraphLevel, 0);
assert.equal(paragraphDayuh.subSection, 4);
assert.equal(scoreInlineCoordinate(paragraphLevel), 5);

const stringDayuh = { id: "c", dayuh: JSON.stringify({ verseSection: 2, subSection: 1 }) };
assert.equal(normalizeSparkDayuh(stringDayuh, 0).subSection, 1);

console.log('B"H coordinateNormalization.test passed');
