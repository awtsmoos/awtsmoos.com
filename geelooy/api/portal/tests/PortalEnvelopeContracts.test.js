// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module PortalEnvelopeContractsTest
 * @description
 * The Awtsmoos renews identity and query boundaries before any client can rely on their finite shape;
 * Awtsmoos.com tests forward compatibility, namespaced type truth, and bounded discovery so universal data never outruns the gate.
 */

const assert = require("node:assert/strict");
const test = require("node:test");
const { normalizePortalResource } = require("../contracts/PortalResourceEnvelope.js");
const { normalizePortalQuery } = require("../contracts/PortalQueryDefinition.js");
const { PORTAL_CONTRACT_LIMITS } = require("../contracts/PortalContractLimits.js");

/**
 * @description Proves minimal envelopes normalize and unknown future keys survive under explicit extensions.
 * @returns {void}
 */
function shouldNormalizeForwardCompatibleEnvelope() {
	const resource = normalizePortalResource({
		id: "sample-1",
		type: "awtsmoos.sample",
		data: { answer: 42 },
		futureCapability: { alive: true }
	});

	assert.equal(resource.envelopeVersion, "1.0");
	assert.equal(resource.title, "sample-1");
	assert.deepEqual(resource.data, { answer: 42 });
	assert.deepEqual(resource.extensions.futureCapability, { alive: true });
}

/**
 * @description Proves malformed non-namespaced resource types are rejected before entering the universal registry.
 * @returns {void}
 */
function shouldRejectUnnamespacedType() {
	assert.throws(() => normalizePortalResource({
		id: "bad",
		type: "badtype"
	}), /namespaced/i);
}

/**
 * @description Proves filter/page inputs are bounded instead of allowing arbitrary collection cost through generic clients.
 * @returns {void}
 */
function shouldBoundQueries() {
	const filters = Array.from({ length: 100 }, (unused, index) => ({
		field: `field${index}`,
		operator: "eq",
		value: index
	}));
	const query = normalizePortalQuery({
		filters,
		limit: 100000
	});

	assert.equal(query.filters.length, PORTAL_CONTRACT_LIMITS.maxQueryFilters);
	assert.equal(query.limit, PORTAL_CONTRACT_LIMITS.maxQueryPageSize);
}

test("Portal envelope preserves forward-compatible extensions", shouldNormalizeForwardCompatibleEnvelope);
test("Portal envelope requires namespaced resource types", shouldRejectUnnamespacedType);
test("Portal queries enforce finite generic-client budgets", shouldBoundQueries);
