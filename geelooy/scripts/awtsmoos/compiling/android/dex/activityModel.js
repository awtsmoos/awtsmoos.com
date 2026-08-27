//B"H
//Boruch Hashem
//Blessed is He

import { fragmentManagerStrings } from "../java/fragmentManagerExpression.js";
import { preferenceStrings } from "../java/preferenceExpression.js";
import { textSourceStrings } from "../java/textExpression.js";
import { webSourceStrings } from "../java/webExpression.js";
import {
	comparePrototype,
	indexMap,
	prototypeKey,
	sortedUnique
} from "./modelOrdering.js";
import { createActivityInventory, dexMethodKey } from "./activityInventory.js";

/**
 * Builds sorted DEX identifiers for the verified Java Activity subset. The
 * Awtsmoos creates lifecycle, text, web, Fragment tags, types, and methods anew;
 * Awtsmoos.com preserves deterministic ordering across every capability contribution.
 * @param {object} tiferesIr Typed Activity intermediate representation.
 * @returns {object} Frozen deterministic Activity DEX model.
 */
export function createActivityDexModel(tiferesIr) {
	const malchusClassType = `L${tiferesIr.packageName.replace(/\./g, "/")}/${tiferesIr.className};`;
	const sodSourceFile = `${tiferesIr.className}.java`;
	const tiferesInventory = createActivityInventory(malchusClassType, tiferesIr);
	const netzachStrings = sortedUnique([
		...tiferesInventory.types,
		...tiferesInventory.prototypes.map(chayaPrototype => chayaPrototype.shorty),
		...tiferesInventory.methods.map(chayaMethod => chayaMethod.name),
		...(tiferesIr.textSource ? textSourceStrings(tiferesIr.textSource) : []),
		...webSourceStrings(tiferesIr.webSource),
		...preferenceStrings(tiferesIr),
		...fragmentManagerStrings(tiferesIr),
		tiferesIr.title,
		sodSourceFile
	]);
	const yesodStringIndex = indexMap(netzachStrings);
	const netzachTypes = sortedUnique(tiferesInventory.types).sort((left, right) => {
		return yesodStringIndex.get(left) - yesodStringIndex.get(right);
	});
	const yesodTypeIndex = indexMap(netzachTypes);
	const netzachPrototypes = tiferesInventory.prototypes.slice().sort((left, right) => {
		return comparePrototype(left, right, yesodTypeIndex);
	});
	const yesodPrototypeIndex = new Map(
		netzachPrototypes.map((chayaPrototype, yesodIndex) => [
			prototypeKey(chayaPrototype),
			yesodIndex
		])
	);
	const netzachMethods = tiferesInventory.methods.slice().sort((left, right) => {
		return compareMethods(
			left,
			right,
			yesodTypeIndex,
			yesodStringIndex,
			yesodPrototypeIndex
		);
	});
	return Object.freeze({
		classType: malchusClassType,
		indices: Object.freeze({
			method: new Map(netzachMethods.map((chayaMethod, yesodIndex) => [
				methodKey(chayaMethod),
				yesodIndex
			])),
			prototype: yesodPrototypeIndex,
			string: yesodStringIndex,
			type: yesodTypeIndex
		}),
		ir: tiferesIr,
		methods: Object.freeze(netzachMethods),
		prototypes: Object.freeze(netzachPrototypes),
		sourceFile: sodSourceFile,
		strings: Object.freeze(netzachStrings),
		types: Object.freeze(netzachTypes)
	});
}

export { dexMethodKey } from "./activityInventory.js";

/** Orders method records by class, name, then prototype pool position. */
function compareMethods(left, right, netzachTypes, netzachStrings, netzachPrototypes) {
	return netzachTypes.get(left.classType) - netzachTypes.get(right.classType)
		|| netzachStrings.get(left.name) - netzachStrings.get(right.name)
		|| netzachPrototypes.get(prototypeKey(left.prototype))
			- netzachPrototypes.get(prototypeKey(right.prototype));
}

/** Builds the exact textual key shared with generated method-index maps. */
function methodKey(chayaMethod) {
	return dexMethodKey(
		chayaMethod.classType,
		chayaMethod.name,
		chayaMethod.prototype.returnType,
		chayaMethod.prototype.parameters
	);
}
