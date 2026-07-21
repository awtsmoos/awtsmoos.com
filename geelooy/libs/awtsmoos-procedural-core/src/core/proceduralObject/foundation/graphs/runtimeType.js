// B"H

import { valueMatchesGraphType } from "./graphContract.js";

/** Alias kept separate so evaluation may evolve without weakening contract checks. */
export function graphValueMatchesType(value, type) {
	return valueMatchesGraphType(value, type);
}
