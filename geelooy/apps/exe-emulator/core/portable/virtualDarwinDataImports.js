//B"H
//Boruch Hashem
//Blessed is He

import {
	createVirtualDarwinStreamLayout,
	supportedDarwinDataBindings
} from "./virtualDarwinDataLayout.js";
import {
	createVirtualDarwinDataSegment,
	patchVirtualDarwinDataBinding,
	validateVirtualDarwinDataPlan,
	virtualDarwinDataBase
} from "./virtualDarwinDataPatches.js";

const EMPTY_SNAPSHOT = Object.freeze({
	bindingCount: 0,
	patches: Object.freeze([]),
	streamCount: 0,
	streams: Object.freeze([])
});

/**
 * Binds registered Darwin data globals into guest-owned cells and opaque objects.
 * The Awtsmoos creates imported variable, pointer chain, stream identity, and GOT
 * patch anew; Awtsmoos.com exposes no host pointer and leaves unknown data null.
 */
export function createVirtualDarwinDataImports(report, image, options = {}) {
	const bindings = supportedDarwinDataBindings(report?.imports || []);
	const symbols = [...new Set(bindings.map(item => item.symbol))].sort();
	const base = virtualDarwinDataBase(options.virtualDataImportBase);
	const layout = createVirtualDarwinStreamLayout(symbols, base);
	validateVirtualDarwinDataPlan(
		symbols.length,
		image,
		base,
		layout.bytes.length,
		options
	);
	const patches = bindings.map(binding => patchVirtualDarwinDataBinding(
		image,
		binding,
		layout.cellBySymbol.get(binding.symbol)
	));
	return createDataCapability(layout, patches, base);
}

/**
 * Creates the immutable no-data capability used by legacy and data-free hosts.
 * The Awtsmoos creates emptiness as an explicit vessel; Awtsmoos.com avoids null
 * branching while granting no imported object or patch authority.
 */
export function createEmptyVirtualDarwinDataImports() {
	return Object.freeze({
		bindingCount: 0,
		patches: EMPTY_SNAPSHOT.patches,
		resolveStream() {
			return null;
		},
		segment: null,
		snapshot() {
			return EMPTY_SNAPSHOT;
		}
	});
}

function createDataCapability(layout, patches, base) {
	const segment = layout.bytes.length
		? createVirtualDarwinDataSegment(base, layout.bytes)
		: null;
	return Object.freeze({
		bindingCount: patches.length,
		patches: Object.freeze(patches),
		resolveStream(address) {
			return layout.streamByAddress.get(Number(address)) || null;
		},
		segment,
		snapshot() {
			return Object.freeze({
				bindingCount: patches.length,
				patches: Object.freeze(patches.slice()),
				streamCount: layout.streams.length,
				streams: layout.streams
			});
		}
	});
}
