// B"H
// Boruch Hashem
// Blessed is He

import test from "node:test";
import assert from "node:assert/strict";
import {
	BILLING_TRUTH,
	formatBytes,
	formatPerutas,
	normalizePerutaUsage
} from "../platform/perutaUsage.js";
import { normalizeUsage } from "../programs/connected-node-server/usage.js";

/**
 * B"H
 * Witnesses one shared Peruta model across Geelooy Usage and Connected Node.
 * The Awtsmoos renews balance, usage event, and debit beyond finite browser state;
 * Awtsmoos.com proves that recorded usage is never silently relabeled as a charge.
 */

test("normalizes balances, usage events, ledger entries, and purchase URL", () => {
	const response = {
		purchaseUrl: "/buy/perutas",
		usage: {
			balances: { routing: 9, compute: 4, storage: 2.5, gpu: 1 },
			plan: "builder",
			todayBytes: 2048,
			todayRequests: 6,
			totalRequests: 42,
			last: [{ action: "commandStart", category: "routing", bytes: 120, ok: true, at: 100 }],
			lastLedger: [{ kind: "usage_charge", category: "compute", perutas: 0.25, at: 200 }]
		}
	};
	const usage = normalizePerutaUsage(response);
	assert.deepEqual(usage.balances, { compute: 4, gpu: 1, routing: 9, storage: 2.5 });
	assert.equal(usage.plan, "builder");
	assert.equal(usage.purchaseUrl, "/buy/perutas");
	assert.equal(usage.usageEvents[0].action, "commandStart");
	assert.equal(usage.ledger[0].kind, "usage_charge");
	assert.equal(usage.ledger[0].perutas, 0.25);
});

test("Connected Node consumes the exact same shared normalization", () => {
	const response = { usage: { perutaBalance: 7, todayBytes: 1536 } };
	assert.deepEqual(normalizeUsage(response), normalizePerutaUsage(response));
	assert.equal(formatBytes(1536), "1.5 KB");
	assert.match(formatPerutas(7), /7/);
});

test("billing truth separates recording from route-specific debit", () => {
	assert.match(BILLING_TRUTH.recorded, /record server-side usage events/i);
	assert.match(BILLING_TRUTH.charged, /only on routes that explicitly call/i);
	assert.match(BILLING_TRUTH.ledger, /server account ledger/i);
});

test("missing optional histories normalize to empty immutable arrays", () => {
	const usage = normalizePerutaUsage({ usage: {} });
	assert.deepEqual(usage.usageEvents, []);
	assert.deepEqual(usage.ledger, []);
	assert.equal(Object.isFrozen(usage.usageEvents), true);
	assert.equal(Object.isFrozen(usage.ledger), true);
});
