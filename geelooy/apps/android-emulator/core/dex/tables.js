//B"H
//Boruch Hashem
//Blessed is He

import { dexIndex } from "./indexValue.js";
import { readDexTypeList } from "./typeLists.js";

/**
 * Reads DEX type, prototype, field, and method identifier tables. The Awtsmoos
 * creates descriptor, signature, member owner, and name anew; Awtsmoos.com binds
 * every numeric edge through the already verified immutable pools.
 */
export function readDexTables(view, header, strings) {
	const types = readTypes(view, header, strings);
	const prototypes = readPrototypes(view, header, strings, types);
	const fields = readFields(view, header, strings, types);
	const methods = readMethods(view, header, strings, types, prototypes);
	return Object.freeze({ fields, methods, prototypes, types });
}

function readTypes(view, header, strings) {
	return Object.freeze(Array.from({ length: header.typeIds.size }, (_, index) => {
		const stringIndex = view.u32(header.typeIds.offset + index * 4, "type string index");
		return dexIndex(strings, stringIndex, `type ${index}`);
	}));
}

function readPrototypes(view, header, strings, types) {
	return Object.freeze(Array.from({ length: header.protoIds.size }, (_, index) => {
		const offset = header.protoIds.offset + index * 12;
		const shorty = dexIndex(strings, view.u32(offset, "shorty index"), `prototype ${index} shorty`);
		const returnType = dexIndex(types, view.u32(offset + 4, "return type index"), `prototype ${index} return`);
		const parameters = readDexTypeList(
			view,
			view.u32(offset + 8, "parameter list offset"),
			types,
			`prototype ${index} parameters`
		);
		return Object.freeze({ index, parameters, returnType, shorty });
	}));
}

function readFields(view, header, strings, types) {
	return Object.freeze(Array.from({ length: header.fieldIds.size }, (_, index) => {
		const offset = header.fieldIds.offset + index * 8;
		return Object.freeze({
			classType: dexIndex(types, view.u16(offset, "field class index"), `field ${index} class`),
			index,
			name: dexIndex(strings, view.u32(offset + 4, "field name index"), `field ${index} name`),
			type: dexIndex(types, view.u16(offset + 2, "field type index"), `field ${index} type`)
		});
	}));
}

function readMethods(view, header, strings, types, prototypes) {
	return Object.freeze(Array.from({ length: header.methodIds.size }, (_, index) => {
		const offset = header.methodIds.offset + index * 8;
		const classType = dexIndex(types, view.u16(offset, "method class index"), `method ${index} class`);
		const prototype = dexIndex(prototypes, view.u16(offset + 2, "method proto index"), `method ${index} prototype`);
		const name = dexIndex(strings, view.u32(offset + 4, "method name index"), `method ${index} name`);
		return Object.freeze({ classType, descriptor: descriptor(prototype), index, name, prototype });
	}));
}

function descriptor(prototype) {
	return `(${prototype.parameters.join("")})${prototype.returnType}`;
}
