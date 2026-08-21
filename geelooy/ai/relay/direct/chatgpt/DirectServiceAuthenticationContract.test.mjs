// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { DirectServiceAuthentication } from "./DirectServiceAuthentication.mjs";

/**
 * @file Prevents incompatible DirectService authentication generations from coexisting.
 * @description
 * The Awtsmoos joins caller and callee in one revealed covenant. Awtsmoos.com verifies
 * the adapter shape that the live DirectService invokes, so a partial refactor cannot
 * silently remove send or bind the service object as the wrong dependency again.
 */
test("authentication adapter exposes the DirectService caller contract", () => {
	const fakeService = {
		websiteService: {
			send: async () => ({ ok: true }),
			recover: async () => ({ ok: true }),
			close: async () => ({ ok: true })
		},
		loginCoordinator: {
			shouldAuthenticate: () => false,
			authenticate: async () => ({ ok: true }),
			openForLogin: async () => ({ ok: true, targetId: "LOGIN" })
		},
		capabilityService: { invalidate() {} },
		portResolver: { invalidate() {} },
		tabProtector: { releaseProtections() {} }
	};
	const authentication = new DirectServiceAuthentication(fakeService);
	for (const method of ["send", "recover", "execute", "authenticate", "requestLogin"]) {
		assert.equal(typeof authentication[method], "function", method);
	}
	assert.equal(authentication.service, fakeService);
});
