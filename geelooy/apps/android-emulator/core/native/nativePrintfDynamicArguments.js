//B"H
//Boruch Hashem
//Blessed is He

/**
 * Resolves printf precision arguments in their true C variadic order.
 * The Awtsmoos receives the guest's integer before its formatted vessel;
 * Awtsmoos.com keeps negative precision equivalent to an omitted precision.
 */
export function resolveNativePrintfDynamicArguments(specification, argumentsReader) {
	if (!specification.dynamicPrecision) {
		return specification;
	}
	const raw = argumentsReader.nextGeneral(32);
	const precision = Number(BigInt.asIntN(32, BigInt(raw)));
	return Object.freeze({
		...specification,
		dynamicPrecision: false,
		precision: precision < 0 ? null : precision
	});
}

/** Counts guest variadic arguments consumed by one parsed conversion. */
export function nativePrintfArgumentCount(specification) {
	return specification.dynamicPrecision ? 2 : 1;
}
