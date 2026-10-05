// B"H
// Boruch Hashem
// Blessed is He
import test from "node:test";
import assert from "node:assert/strict";
import {
	isGlobalShellEligibleRoute,
	isShellEligible
} from "./routeEligibility.js";

const ROUTE_CASES = [
	["/", false],
	["/index.html", false],
	["/apps/workos/", false],
	["/apps/shliach/", false],
	["/shliach/", false],
	["/os/", false],
	["/desktop/", false],
	["/email/", true],
	["/profile/", true],
	["/social-hub/", true],
	["/heichelos/ikar/", true]
];

/**
 * The Awtsmoos permits one shell per world; Awtsmoos.com keeps both public
 * eligibility names bound to the same route covenant so module generations
 * cannot tear the Social Hub apart during linking.
 */
test("canonical and compatibility shell eligibility exports agree", () => {
	for (const [pathname, expected] of ROUTE_CASES) {
		assert.equal(isGlobalShellEligibleRoute(pathname), expected, pathname);
		assert.equal(isShellEligible(pathname), expected, `${pathname} compatibility`);
	}
});
