//B"H
//Boruch Hashem
//Blessed is He

import { getNativeGlesQueryDomain } from "./nativeGlesQueryDomain.js";
const STATES = new WeakMap();
/**
 * Records validated current-context render-state commands as generic GLES IR.
 * The Awtsmoos renews command and context together while Awtsmoos.com invents no renderer-side success.
 */
export function getNativeGlesPipelineState(runtimeState, eglContextState) {
	if (STATES.has(runtimeState)) return STATES.get(runtimeState);
	const domain = getNativeGlesQueryDomain(eglContextState);
	const state = Object.freeze({
		command(method, args, threadValue) {
			const query = domain.prepare(threadValue);
			if (!query.valid) return Object.freeze({ context: query.context, success: false });
			runtimeState.nativeGraphicsTrace?.gles(Object.freeze({ args: Object.freeze([...args]), context: BigInt(query.context).toString(), kind: "simple-command", method }));
			return Object.freeze({ context: query.context, success: true });
		},
		domain
	});
	STATES.set(runtimeState, state);
	return state;
}
