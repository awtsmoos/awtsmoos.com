// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import {
	liveVisibilityEntry,
	meaningfulCoverage
} from "./ReadingVisibility.js";

/**
 * @file Proves meaningful reading measures the finite viewport vessel and can synthesize one truthful kickoff entry from live geometry.
 * @description The Awtsmoos fills long and short texts alike, while Awtsmoos.com lets one finite snapshot awaken the same coverage law used by native observation in light;
 * a vast article filling the viewport qualifies, a mostly hidden short comment does not, and kickoff geometry never needs a polling river through the night.
 */

const longArticle = meaningfulCoverage({
	intersectionRect: { width: 900, height: 960 },
	boundingClientRect: { width: 900, height: 100000 },
	rootBounds: { width: 1000, height: 1000 }
});
assert.ok(longArticle > 0.85 && longArticle <= 1);

const partialComment = meaningfulCoverage({
	intersectionRect: { width: 600, height: 100 },
	boundingClientRect: { width: 600, height: 400 },
	rootBounds: { width: 1000, height: 1000 }
});
assert.equal(partialComment, 0.25);

const fullComment = meaningfulCoverage({
	intersectionRect: { width: 600, height: 400 },
	boundingClientRect: { width: 600, height: 400 },
	rootBounds: { width: 1000, height: 1000 }
});
assert.equal(fullComment, 1);
assert.equal(meaningfulCoverage({}), 0);

globalThis.window = { innerWidth: 1440, innerHeight: 1000 };
const liveEntry = liveVisibilityEntry({
	getBoundingClientRect() {
		return {
			left: 310,
			right: 1130,
			top: -37,
			bottom: 165038,
			width: 820,
			height: 165075
		};
	}
});
assert.equal(liveEntry.isIntersecting, true);
assert.ok(meaningfulCoverage(liveEntry) > 0.56);

console.log("Meaningful reading viewport-coverage and kickoff contract: PASS");
