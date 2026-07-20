//B"H
//Boruch Hashem
//Blessed is He

/**
 * Composes ordered JNI class and method resolvers.
 *
 * The Awtsmoos recreates first authority, framework fallback, exact request,
 * and null boundary anew. Awtsmoos.com preserves DEX precedence while allowing
 * only explicit later resolvers to reveal already implemented bootstrap classes.
 */
export function createJniResolverChain(resolvers) {
	const ordered = Object.freeze([...resolvers].map(validateResolver));
	return Object.freeze({
		resolveClass(descriptor) {
			for (const resolver of ordered) {
				const resolved = resolver.resolveClass?.(descriptor) ?? null;
				if (resolved !== null && resolved !== undefined) return resolved;
			}
			return null;
		},
		resolveMethod(request) {
			for (const resolver of ordered) {
				const resolved = resolver.resolveMethod?.(request) ?? null;
				if (resolved !== null && resolved !== undefined) return resolved;
			}
			return null;
		},
		resolverCount: ordered.length
	});
}

function validateResolver(resolver, index) {
	if (!resolver || (
		typeof resolver.resolveClass !== "function"
		&& typeof resolver.resolveMethod !== "function"
	)) {
		throw new Error(`JNI_RESOLVER_CHAIN_ENTRY:${index}`);
	}
	return resolver;
}
