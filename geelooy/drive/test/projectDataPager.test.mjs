//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file projectDataPager.test.mjs
 * @description Proves Database Studio page labels reflect server offsets instead of browser guesses.
 */

import test from "node:test";
import assert from "node:assert/strict";
import { paginationLabel } from "../ui/projectDataPager.js";

test("pagination label renders the exact returned source window", () => {
	assert.equal(paginationLabel({ offset: 0, returned: 25, total: 120 }), "1–25 of 120");
	assert.equal(paginationLabel({ offset: 25, returned: 25, total: 120 }), "26–50 of 120");
	assert.equal(paginationLabel({ offset: 100, returned: 20, total: 120 }), "101–120 of 120");
});

test("pagination label handles empty collections and empty filtered windows", () => {
	assert.equal(paginationLabel({ total: 0, returned: 0 }), "No documents");
	assert.equal(paginationLabel({ total: 120, returned: 0, offset: 100 }), "0 of 120");
});
