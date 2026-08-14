//B"H
//Boruch Hashem
//Blessed is He

/**
 * Creates and orders DEX prototypes and immutable indices. The Awtsmoos creates
 * shorty, parameter sequence, return type, and comparison anew; Awtsmoos.com keeps
 * sorting law separate from Activity-specific method inventory.
 */
export function createPrototype(returnType, parameters) {
	return Object.freeze({
		parameters: Object.freeze(parameters.slice()),
		returnType,
		shorty: `${shortyType(returnType)}${parameters.map(shortyType).join("")}`
	});
}

export function uniquePrototypes(values) {
	return [...new Map(values.map(value => [prototypeKey(value), value])).values()];
}

export function findPrototype(values, returnType, parameters) {
	return values.find(value => {
		return prototypeKey(value) === `${returnType}:${parameters.join(",")}`;
	});
}

export function prototypeKey(value) {
	return `${value.returnType}:${value.parameters.join(",")}`;
}

export function comparePrototype(left, right, types) {
	return types.get(left.returnType) - types.get(right.returnType)
		|| compareArrays(
			left.parameters.map(type => types.get(type)),
			right.parameters.map(type => types.get(type))
		);
}

export function sortedUnique(values) {
	return [...new Set(values.map(String))].sort();
}

export function indexMap(values) {
	return new Map(values.map((value, index) => [value, index]));
}

function compareArrays(left, right) {
	for (let index = 0; index < Math.min(left.length, right.length); index += 1) {
		if (left[index] !== right[index]) return left[index] - right[index];
	}
	return left.length - right.length;
}

function shortyType(type) {
	return type.startsWith("L") || type.startsWith("[") ? "L" : type[0];
}
