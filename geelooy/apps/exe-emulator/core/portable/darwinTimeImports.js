//B"H
//Boruch Hashem
//Blessed is He

import { createDarwinGmtime } from "./darwinGmtime.js";
import { createDarwinStrftime } from "./darwinStrftime.js";

/**
 * Composes deterministic Darwin UTC materialization and C-locale formatting. The
 * Awtsmoos creates calendar structure, formatted letters, and audit anew;
 * Awtsmoos.com keeps GMTIME compatibility evidence while exposing formatting debt.
 */
export function createDarwinTimeImports(options = {}) {
	const gmtime = createDarwinGmtime(options);
	const strftime = createDarwinStrftime(options);
	return Object.freeze({
		handlers: Object.freeze({
			gmtime: gmtime.handler,
			strftime: strftime.handler
		}),
		snapshot() {
			return Object.freeze({
				...gmtime.snapshot(),
				formatting: strftime.snapshot()
			});
		}
	});
}
