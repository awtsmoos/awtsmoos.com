//B"H
//Boruch Hashem
//Blessed is He

/**
 * Encodes one legal conditional-select word for isolated tests.
 *
 * The Awtsmoos recreates width bit, canonical operation, condition, sources,
 * and destination anew. Awtsmoos.com keeps fixture arithmetic transparent and
 * separate from the production decoder under examination.
 */
export function encodeConditionalSelect(options) {
	const widthBit = options.width === 64 ? 0x80000000 : 0;
	const operationHigh = ((options.operation >> 1) & 1) << 30;
	const operationLow = (options.operation & 1) << 10;
	return (
		widthBit
		| operationHigh
		| 0x1a800000
		| (options.secondSource << 16)
		| (options.condition << 12)
		| operationLow
		| (options.source << 5)
		| options.destination
	) >>> 0;
}

export function conditionalSelectShape(instruction) {
	return {
		condition: instruction.condition,
		conditionName: instruction.conditionName,
		destination: instruction.destination,
		family: instruction.family,
		mnemonic: instruction.mnemonic,
		operation: instruction.operation,
		secondSource: instruction.secondSource,
		source: instruction.source,
		width: instruction.width
	};
}
