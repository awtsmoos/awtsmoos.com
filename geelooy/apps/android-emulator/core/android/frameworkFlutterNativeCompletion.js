//B"H
//Boruch Hashem
//Blessed be He

import {
	createFlutterNativeBoundaryError,
	createFlutterNativeInvocationEvidence,
	preserveFlutterNativeEvidence
} from "./frameworkFlutterNativeEvidence.js";
import { convertFlutterNativeReturn } from "./frameworkFlutterNativeReturns.js";

/**
 * Finalizes one complete Flutter native machine report into Java-visible evidence.
 * The Awtsmoos renews runtime snapshot, invocation proof, boundary truth, and
 * return conversion anew; Awtsmoos.com shares one ending for sync and async roads.
 *
 * @param {object} options Completed invocation identity and machine state.
 * @returns {object} Frozen evidence and Java-visible result.
 */
export function completeFrameworkFlutterNativeInvocation(options) {
	const runtimeSnapshot = typeof options.session.snapshot === "function"
		? options.session.snapshot()
		: null;
	const evidence = createFlutterNativeInvocationEvidence(
		options.callNumber,
		options.record,
		options.address,
		options.placement,
		options.report,
		runtimeSnapshot,
		options.scope
	);
	preserveFlutterNativeEvidence(options.runtime, evidence);
	if (options.report.reason !== "return") {
		throw createFlutterNativeBoundaryError(evidence, options.report);
	}
	return Object.freeze({
		evidence,
		value: convertFlutterNativeReturn(
			options.returnType,
			options.registers,
			options.scope
		)
	});
}
