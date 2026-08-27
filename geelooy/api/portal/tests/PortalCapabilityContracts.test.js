// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module PortalCapabilityContractsTest
 * @description
 * The Awtsmoos renews action, provenance, job, and transformation potential while each finite contract must remain honest;
 * Awtsmoos.com tests confirmation, cancellation, verification, and fanout semantics so advertised power never exceeds the vessel it can promise.
 */

const assert = require("node:assert/strict");
const test = require("node:test");
const { normalizePortalActionDefinition } = require("../contracts/PortalActionDefinition.js");
const { normalizePortalJob } = require("../contracts/PortalJob.js");
const { normalizePortalProvenance } = require("../contracts/PortalProvenance.js");
const { normalizePortalTransformation } = require("../contracts/PortalTransformation.js");
const { PORTAL_CONTRACT_LIMITS } = require("../contracts/PortalContractLimits.js");

/**
 * @description Proves action descriptors retain explicit confirmation, execution, idempotency, and retry semantics.
 * @returns {void}
 */
function shouldNormalizeActionSemantics() {
	const action = normalizePortalActionDefinition({
		id: "archive.resource",
		label: "Archive resource",
		confirmation: "confirm",
		execution: "job",
		idempotency: "keyed",
		retryable: true
	});

	assert.equal(action.confirmation, "confirm");
	assert.equal(action.execution, "job");
	assert.equal(action.idempotency, "keyed");
	assert.equal(action.retryable, true);
}

/**
 * @description Proves jobs can represent requested cancellation without falsely claiming work has already stopped.
 * @returns {void}
 */
function shouldModelHonestCancellation() {
	const job = normalizePortalJob({
		id: "job-1",
		state: "cancel-requested",
		canCancel: false
	});

	assert.equal(job.state, "cancel-requested");
	assert.equal(job.progress, null);
}

/**
 * @description Proves provenance distinguishes inferred data from verified or authored fact.
 * @returns {void}
 */
function shouldPreserveProvenanceTruth() {
	const provenance = normalizePortalProvenance({
		kind: "generated",
		verification: "inferred",
		confidence: 4
	});

	assert.equal(provenance.kind, "generated");
	assert.equal(provenance.verification, "inferred");
	assert.equal(provenance.confidence, 1);
}

/**
 * @description Proves transformation fanout is bounded even when a caller requests effectively unlimited generation.
 * @returns {void}
 */
function shouldBoundTransformationFanout() {
	const transformation = normalizePortalTransformation({
		id: "generate.variants",
		fanoutMax: 999999,
		sideEffectClass: "none"
	});

	assert.equal(transformation.fanoutMax, PORTAL_CONTRACT_LIMITS.maxTransformationFanout);
}

test("Portal actions expose explicit execution semantics", shouldNormalizeActionSemantics);
test("Portal jobs distinguish cancel-requested from cancelled", shouldModelHonestCancellation);
test("Portal provenance preserves inference status", shouldPreserveProvenanceTruth);
test("Portal transformations bound output fanout", shouldBoundTransformationFanout);
