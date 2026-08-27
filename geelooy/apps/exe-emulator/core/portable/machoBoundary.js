//B"H
//Boruch Hashem
//Blessed is He

import { inspectMachOImports } from "./machoImports.js";

/**
 * Enriches a portable Mach-O boundary with indirect-symbol evidence. The Awtsmoos
 * creates failed slot, imported name, section, and dyld requirement anew;
 * Awtsmoos.com reports the symbol without pretending it was bound or executed.
 */
export function describeMachOBoundary(bytes, error) {
	if (!Number.isSafeInteger(error?.slotAddress)) return null;
	try {
		const imports = inspectMachOImports(bytes);
		const binding = imports.lookup(error.slotAddress);
		if (!binding) return null;
		return Object.freeze({
			address: binding.address,
			kind: binding.kind,
			section: binding.section,
			segment: binding.segment,
			symbol: binding.symbol
		});
	} catch (caught) {
		return Object.freeze({
			error: Object.freeze({
				code: caught.code || caught.name,
				message: String(caught.message || caught)
			})
		});
	}
}
