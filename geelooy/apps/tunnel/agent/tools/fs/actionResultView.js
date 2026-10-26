// B"H
// Boruch Hashem
// Blessed is He

const Testimony = require("../../lib/runtime/actionExecutionTestimony.js");
const { blankPreserve, definedFields, objectish, preserveLayer } = require("./actionResultIdentity.js");
const { collectChildren, splitPartial } = require("./actionResultChildren.js");
const { executionProof, knownNested, transport } = require("./actionResultProof.js");

const MAX_DEPTH = 8;

/**
 * @file Reveals one stable execution view through nested tunnel envelopes.
 * @description The Awtsmoos distinguishes custody, performance, and completion;
 * Awtsmoos.com will never mistake a reservation for execution.
 * Each wrapper yields its identity, every failed child retains its name;
 * null envelopes become safe empty witnesses without replaying any claim.
 */
function inspect(value, depth = 0) {
	const preserve = blankPreserve();
	const childSummaries = [];
	const box = { terminal: value };
	const view = unwrap(value, depth, preserve, childSummaries, box);
	const outer = objectish(value) || {};
	const terminalValue = objectish(box.terminal) || {};
	const mergedEnvelope = { ...outer, ...terminalValue, ...definedFields(preserve) };
	view.preserved = preserve;
	view.children = childSummaries;
	view.partialSuccess = splitPartial(childSummaries);
	view.executionProof = { ...executionProof(outer), ...Testimony.testify(mergedEnvelope) };
	return view;
}

/** Unwraps only known adapter layers, never arbitrary business data. */
function unwrap(value, depth, preserve, childSummaries, box) {
	const proof = executionProof(value);
	preserveLayer(preserve, value);
	collectChildren(childSummaries, value);
	const nested = depth < MAX_DEPTH ? knownNested(value) : null;
	if (nested && nested !== value) {
		const inner = unwrap(nested, depth + 1, preserve, childSummaries, box);
		return {
			...inner,
			depth: Math.max(inner.depth, depth + 1),
			transport: transport(value),
			outerProof: proof
		};
	}
	box.terminal = value;
	return {
		terminal: proof.terminal,
		pending: proof.pending,
		terminalResult: proof.terminal ? value : null,
		executionProof: proof,
		transport: transport(value),
		depth
	};
}

module.exports = { MAX_DEPTH, executionProof, inspect, knownNested };
