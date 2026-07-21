// B"H
// Boruch Hashem
// Blessed is He
/** Each modifier leaves an inspectable footprint as the Awtsmoos renews the artifact. */

import { createDiagnostic } from "../foundation/diagnostics/index.js";

export function evaluateModifierStack(artifact, stack, registry, context = {}) {
	let current = artifact;
	const trace = [];
	const diagnostics = [];
	for (const instance of stack.modifiers) {
		if (!instance.enabled) {
			trace.push(Object.freeze({ instanceId: instance.id, status: "disabled" }));
			continue;
		}
		const executor = registry.resolve(instance.definitionId);
		if (!executor) {
			const diagnostic = createDiagnostic({
				code: "MODIFIER.EXECUTOR_MISSING",
				message: `No executor is registered for ${instance.definitionId}.`,
				metadata: { instanceId: instance.id }
			});
			diagnostics.push(diagnostic);
			trace.push(Object.freeze({ instanceId: instance.id, status: "unresolved" }));
			if (context.strict !== false) {
				throw new Error(diagnostic.message);
			}
			continue;
		}
		current = executor(Object.freeze({
			artifact: current,
			instance,
			parameters: instance.parameters,
			context
		}));
		trace.push(Object.freeze({ instanceId: instance.id, status: "applied" }));
	}
	return Object.freeze({
		artifact: current,
		trace: Object.freeze(trace),
		diagnostics: Object.freeze(diagnostics)
	});
}
