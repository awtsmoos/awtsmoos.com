//B"H
//Boruch Hashem
//Blessed is He

/**
 * Walks guest class ancestry for the nearest matching method. The Awtsmoos
 * creates receiver type, superclass road, and executable vessel anew;
 * Awtsmoos.com replaces framework declarations only with proven guest code.
 */
export function findDalvikClassMethod(
	registry,
	startType,
	name,
	descriptor,
	options = {}
) {
	let type = startType;
	const visited = new Set();
	while (type && !visited.has(type)) {
		visited.add(type);
		const record = registry.bySignature(
			`${type}->${name}${descriptor}`
		);
		if (record && (!options.executableOnly || record.code)) {
			return record;
		}
		type = registry.superType(type);
	}
	return null;
}

/**
 * Proves transitive class and interface assignability from loaded guest DEX.
 */
export function isDalvikTypeAssignable(
	registry,
	sourceType,
	targetType,
	visited = new Set()
) {
	if (sourceType === targetType) return true;
	if (!sourceType || visited.has(sourceType)) return false;
	visited.add(sourceType);
	const definition = registry.classDefinition(sourceType);
	if (!definition) return false;
	for (const interfaceType of definition.interfaces || []) {
		if (isDalvikTypeAssignable(
			registry,
			interfaceType,
			targetType,
			visited
		)) return true;
	}
	return isDalvikTypeAssignable(
		registry,
		definition.superType,
		targetType,
		visited
	);
}

/**
 * Finds the single most-specific executable default interface method.
 */
export function findDalvikDefaultInterfaceMethod(
	registry,
	startType,
	name,
	descriptor
) {
	const interfaces = collectInterfaces(registry, startType);
	const candidates = interfaces
		.map(type => registry.bySignature(`${type}->${name}${descriptor}`))
		.filter(record => Boolean(record?.code));
	const specific = candidates.filter(candidate => {
		return !candidates.some(other => {
			return other !== candidate
				&& isDalvikTypeAssignable(
					registry,
					other.method.classType,
					candidate.method.classType
				);
		});
	});
	if (specific.length <= 1) return specific[0] || null;
	throw dispatchHierarchyError(
		"DALVIK_INTERFACE_DEFAULT_AMBIGUOUS",
		specific.map(record => record.signature).join(",")
	);
}

function collectInterfaces(registry, startType) {
	const output = new Set();
	const pending = [startType];
	const visited = new Set();
	while (pending.length) {
		const type = pending.shift();
		if (!type || visited.has(type)) continue;
		visited.add(type);
		const definition = registry.classDefinition(type);
		if (!definition) continue;
		for (const interfaceType of definition.interfaces || []) {
			output.add(interfaceType);
			pending.push(interfaceType);
		}
		pending.push(definition.superType);
	}
	return [...output];
}

function dispatchHierarchyError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	error.detail = detail;
	return error;
}
