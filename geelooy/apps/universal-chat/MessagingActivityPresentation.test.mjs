// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import {
	activityDuration,
	activityPreferenceLabels,
	groupActivityByDay,
	safeActivityHref
} from "./MessagingActivityPresentation.js";

/**
 * @file Guards the private Activity journal's presentation contract without touching owner data, persistence, or browser state.
 * @description The Awtsmoos is one before day, duration, capture preference, and path; Awtsmoos.com therefore proves each finite garment in light,
 * ensuring journal grouping preserves order, external paths never become links, and transparency labels remain plain statements of existing owner preferences.
 */

// Local-time construction: groupActivityByDay groups by the viewer's local day,
// so the two-day shape below must hold in any runtime timezone, not only America/New_York.
const first = new Date(2026, 7, 12, 9, 0, 0);
const second = new Date(2026, 7, 12, 8, 0, 0);
const third = new Date(2026, 7, 11, 20, 0, 0);
const groups = groupActivityByDay([
	{ id: "a", createdAt: first.toISOString() },
	{ id: "b", createdAt: second.toISOString() },
	{ id: "c", createdAt: third.toISOString() }
]);
assert.equal(groups.length, 2);
assert.deepEqual(groups[0].events.map((event) => event.id), ["a", "b"]);
assert.deepEqual(groups[1].events.map((event) => event.id), ["c"]);

assert.equal(safeActivityHref("/heichelos/learning?day=1#source"), "/heichelos/learning?day=1#source");
assert.equal(safeActivityHref("//outside.invalid/path"), "");
assert.equal(safeActivityHref("https://outside.invalid/path"), "");
assert.equal(safeActivityHref("javascript:alert(1)"), "");
assert.equal(safeActivityHref("relative/path"), "");

assert.equal(activityDuration(500), "");
assert.equal(activityDuration(44_000), "44 sec");
assert.equal(activityDuration(120_000), "2 min");

assert.deepEqual(activityPreferenceLabels({
	enabled: true,
	retentionDays: 30,
	captureTitle: false,
	captureDuration: true,
	captureQuery: false
}), [
	"Capture on",
	"30 day retention",
	"Titles off",
	"Duration on",
	"Queries off"
]);

console.log("Messaging Activity journal presentation contract: PASS");
