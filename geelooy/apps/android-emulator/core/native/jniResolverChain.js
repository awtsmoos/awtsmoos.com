//B"H
//Boruch Hashem
//Blessed is He

/**
 * Composes ordered JNI class, field, and method resolvers.
 *
 * The Awtsmoos recreates first authority, framework fallback, exact request,
 * and null boundary anew. Awtsmoos.com preserves DEX precedence while allowing
 * only explicit later resolvers to reveal implemented bootstrap capabilities.
 */
export function createJniResolverChain(resolvers) {
	const ordered = Object.freeze([...resolvers].map(validateResolver));
	return Object.freeze({
		resolveClass(descriptor) {
			return firstResolved(ordered, "resolveClass", descriptor);
		},
		resolveField(request) {
			return firstResolved(ordered, "resolveField", request);
		},
		resolveMethod(request) {
			return firstResolved(ordered, "resolveMethod", request);
		},
		resolverCount: ordered.length
	});
}

function firstResolved(resolvers, methodName, argument) {
	for (const resolver of resolvers) {
		const method = resolver[methodName];
		const resolved = typeof method === "function"
			? method.call(resolver, argument)
			: null;
		if (resolved !== null && resolved !== undefined) return resolved;
	}
	return null;
}

function validateResolver(resolver, index) {
	if (!resolver || ![
		"resolveClass",
		"resolveField",
		"resolveMethod"
	].some(name => typeof resolver[name] === "function")) {
		throw new Error(`JNI_RESOLVER_CHAIN_ENTRY:${index}`);
	}
	return resolver;
}
