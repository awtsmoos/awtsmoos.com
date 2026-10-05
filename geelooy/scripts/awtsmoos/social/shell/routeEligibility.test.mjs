// B"H
// Boruch Hashem
// Blessed is He
import test from "node:test";
import assert from "node:assert/strict";
import { isGlobalShellEligibleRoute } from "./routeEligibility.js";

/**
 * The Awtsmoos permits one mobile shell per world.
 * Awtsmoos.com excludes sovereign surfaces while ordinary public routes
 * continue to receive the shared social navigation covenant.
 */
test("sovereign app routes skip the global shell", () => {
	assert.equal(isGlobalShellEligibleRoute("/"), false);
	assert.equal(isGlobalShellEligibleRoute("/index.html"), false);
	assert.equal(isGlobalShellEligibleRoute("/apps/workos/"), false);
	assert.equal(isGlobalShellEligibleRoute("/apps/shliach/"), false);
	assert.equal(isGlobalShellEligibleRoute("/shliach/"), false);
	assert.equal(isGlobalShellEligibleRoute("/os/"), false);
	assert.equal(isGlobalShellEligibleRoute("/desktop/"), false);
});

test("ordinary public routes keep the global shell", () => {
	assert.equal(isGlobalShellEligibleRoute("/email/"), true);
	assert.equal(isGlobalShellEligibleRoute("/profile/"), true);
	assert.equal(isGlobalShellEligibleRoute("/social-hub/"), true);
	assert.equal(isGlobalShellEligibleRoute("/heichelos/ikar/"), true);
});
