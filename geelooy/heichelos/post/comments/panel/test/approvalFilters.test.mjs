// B"H
import assert from "node:assert/strict";
import { approvalPassesFilter } from "../approvalFilters.js";

const oldWindow = globalThis.window;
globalThis.window = { currentVerseSection: 7, currentSubSection: 2 };

const coordinateFor = comment => comment.coordinate;
const matching = { coordinate: { verseSection: 7, subSection: 2 } };
const otherSection = { coordinate: { verseSection: 9, subSection: 2 } };
const otherSub = { coordinate: { verseSection: 7, subSection: 4 } };

assert.equal(approvalPassesFilter(otherSection, "all", coordinateFor), true);
assert.equal(approvalPassesFilter(matching, "section", coordinateFor), true);
assert.equal(approvalPassesFilter(otherSection, "section", coordinateFor), false);
assert.equal(approvalPassesFilter(matching, "coordinate", coordinateFor), true);
assert.equal(approvalPassesFilter(otherSub, "coordinate", coordinateFor), false);

globalThis.window = oldWindow;
console.log('B"H approvalFilters.test passed');
