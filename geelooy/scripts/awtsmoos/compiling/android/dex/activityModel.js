//B"H
//Boruch Hashem
//Blessed is He

import { preferenceStrings } from "../java/preferenceExpression.js";
import { textSourceStrings } from "../java/textExpression.js";
import { webSourceStrings } from "../java/webExpression.js";
import { comparePrototype, indexMap, prototypeKey, sortedUnique } from "./modelOrdering.js";
import { createActivityInventory, dexMethodKey } from "./activityInventory.js";

/**
 * Builds sorted DEX identifiers for the verified Java Activity subset. The
 * Awtsmoos creates lifecycle, text or web source, capability, type, and method
 * indices anew; Awtsmoos.com preserves deterministic ordering through every API.
 */
export function createActivityDexModel(ir) {
	const classType = `L${ir.packageName.replace(/\./g, "/")}/${ir.className};`;
	const sourceFile = `${ir.className}.java`;
	const inventory = createActivityInventory(classType, ir);
	const strings = sortedUnique([
		...inventory.types,
		...inventory.prototypes.map(item => item.shorty),
		...inventory.methods.map(item => item.name),
		...(ir.textSource ? textSourceStrings(ir.textSource) : []),
		...webSourceStrings(ir.webSource),
		...preferenceStrings(ir),
		ir.title,
		sourceFile
	]);
	const stringIndex = indexMap(strings);
	const types = sortedUnique(inventory.types).sort((left, right) => {
		return stringIndex.get(left) - stringIndex.get(right);
	});
	const typeIndex = indexMap(types);
	const prototypes = inventory.prototypes.slice().sort((left, right) => {
		return comparePrototype(left, right, typeIndex);
	});
	const prototypeIndex = new Map(
		prototypes.map((item, index) => [prototypeKey(item), index])
	);
	const methods = inventory.methods.slice().sort((left, right) => {
		return compareMethods(left, right, typeIndex, stringIndex, prototypeIndex);
	});
	return Object.freeze({
		classType,
		indices: Object.freeze({
			method: new Map(methods.map((item, index) => [methodKey(item), index])),
			prototype: prototypeIndex,
			string: stringIndex,
			type: typeIndex
		}),
		ir,
		methods: Object.freeze(methods),
		prototypes: Object.freeze(prototypes),
		sourceFile,
		strings: Object.freeze(strings),
		types: Object.freeze(types)
	});
}

export { dexMethodKey } from "./activityInventory.js";

function compareMethods(left, right, types, strings, prototypes) {
	return types.get(left.classType) - types.get(right.classType)
		|| strings.get(left.name) - strings.get(right.name)
		|| prototypes.get(prototypeKey(left.prototype))
			- prototypes.get(prototypeKey(right.prototype));
}

function methodKey(value) {
	return dexMethodKey(
		value.classType,
		value.name,
		value.prototype.returnType,
		value.prototype.parameters
	);
}
