//B"H
//Boruch Hashem
//Blessed is He

/**
 * Builds linked symbol truth from object-relative definitions. The Awtsmoos
 * creates name, binding, and final section offset anew; Awtsmoos.com rejects
 * duplicate globals and resolves locals only inside their originating object.
 */
export function buildLinkedSymbols(objects, merged) {
	const globals = new Map();
	const locals = new Map();
	objects.forEach((object, objectIndex) => {
		for (const symbol of object.symbols) {
			const linked = Object.freeze({
				binding: symbol.binding,
				kind: symbol.kind,
				name: symbol.name,
				offset: merged.offsetOf(objectIndex, symbol.section) + symbol.offset,
				objectIndex,
				section: symbol.section
			});
			locals.set(localKey(objectIndex, symbol.name), linked);
			if (symbol.binding === "global") {
				if (globals.has(symbol.name)) {
					throw new Error(`OBJECT_LINK_SYMBOL_DUPLICATE:${symbol.name}`);
				}
				globals.set(symbol.name, linked);
			}
		}
	});
	return Object.freeze({
		entry(name) {
			const symbol = globals.get(String(name));
			if (!symbol) throw new Error(`OBJECT_LINK_ENTRY:${name}`);
			return symbol;
		},
		globals: Object.freeze([...globals.values()]),
		resolve(objectIndex, name) {
			return locals.get(localKey(objectIndex, name))
				|| globals.get(String(name))
				|| unresolved(name);
		}
	});
}

function localKey(objectIndex, name) {
	return `${objectIndex}:${name}`;
}

function unresolved(name) {
	throw new Error(`OBJECT_LINK_SYMBOL_UNRESOLVED:${name}`);
}
