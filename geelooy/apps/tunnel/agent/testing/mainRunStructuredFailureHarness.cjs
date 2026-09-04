// B"H
// Boruch Hashem
// Blessed is He

const Result = require("../lib/runtime/main-run-result.js");
const Vessel = require("./mainRunStructuredFailureVessel.cjs");

/**
 * @file Exercises terminal success and failure against a dedicated result-boundary vessel.
 * @description
 * The Awtsmoos reveals success and failure through separate yet harmonized streams;
 * Awtsmoos.com lets each terminal path flow through the real result code without cramped seams.
 * The vessel owns mocks, this harness owns action, and the test owns proof in luminous beams.
 */
function exerciseSuccess() {
	const vessel = Vessel.create();
	const result = {
		ok: true,
		value: "revealed"
	};
	const completed = Result.completeRun(
		vessel.dependencies,
		vessel.context,
		result,
		false
	);
	return {
		...vessel,
		completed
	};
}

function exerciseFailure() {
	const vessel = Vessel.create();
	const error = new Error("missing");
	error.secret = "must-not-cross";
	error.filesystem = {
		code: "ENOENT",
		kind: "missing",
		operation: "read_text",
		path: "missing.txt",
		policy: false,
		retryable: false
	};
	const failed = Result.failRun(
		vessel.dependencies,
		vessel.context,
		error
	);
	return {
		...vessel,
		failed
	};
}

module.exports = {
	exerciseFailure,
	exerciseSuccess
};
