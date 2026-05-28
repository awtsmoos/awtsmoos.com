// B"H
import assert from "node:assert/strict";
import {
    buildRealPlacementDayuh,
    getCommentVerseSection,
    getRealCommentSubSection,
    isSpecificSubsectionComment,
    isVerseLevelComment
} from "../realCommentCoordinate.js";

const verseOnly = { id: "v", dayuh: { verseSection: 0 }, sub: 9, subSection: 9 };
assert.equal(getCommentVerseSection(verseOnly), 0);
assert.equal(getRealCommentSubSection(verseOnly), null);
assert.equal(isVerseLevelComment(verseOnly), true);
assert.equal(isSpecificSubsectionComment(verseOnly), false);
assert.equal(Object.hasOwn(buildRealPlacementDayuh(verseOnly), "subSection"), false);

const paragraph = { id: "p", dayuh: { verseSection: 0, subSection: 1 } };
assert.equal(getRealCommentSubSection(paragraph), 1);
assert.equal(isSpecificSubsectionComment(paragraph), true);
assert.equal(isVerseLevelComment(paragraph), false);
assert.equal(buildRealPlacementDayuh(paragraph).subSection, 1);

const stringDayuh = { id: "s", dayuh: JSON.stringify({ verseSection: 4, subSection: 2 }) };
assert.equal(getCommentVerseSection(stringDayuh), 4);
assert.equal(getRealCommentSubSection(stringDayuh), 2);

const mainNames = [null, undefined, "", "main", "root"];
for (const subSection of mainNames) {
    const dayuh = { verseSection: 3, subSection };
    assert.equal(getRealCommentSubSection({ dayuh }), null);
    assert.equal(Object.hasOwn(buildRealPlacementDayuh({ dayuh }), "subSection"), false);
}

console.log('B"H realCommentCoordinate.test passed');
