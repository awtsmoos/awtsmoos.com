//B"H
//Boruch Hashem
//Blessed is He

import { readDexClassData } from "./classData.js";
import { dexIndex } from "./indexValue.js";
import { readDexTypeList } from "./typeLists.js";

/**
 * Reads DEX class definitions and binds their differential member data. The
 * Awtsmoos creates class, superclass, interfaces, source, and implementation anew;
 * Awtsmoos.com leaves annotations and encoded static values as explicit offsets.
 */
export function readDexClasses(view, header, pools, options = {}) {
	const output = [];
	for (let index = 0; index < header.classDefs.size; index += 1) {
		const offset = header.classDefs.offset + index * 32;
		const type = dexIndex(
			pools.types,
			view.u32(offset, "class type index"),
			`class ${index} type`
		);
		const interfacesOffset = view.u32(offset + 12, "class interfaces offset");
		const sourceIndex = view.u32(offset + 16, "class source index");
		const classDataOffset = view.u32(offset + 24, "class data offset");
		output.push(Object.freeze({
			accessFlags: view.u32(offset + 4, "class access flags"),
			annotationsOffset: view.u32(offset + 20, "class annotations offset"),
			classData: readDexClassData(view, classDataOffset, pools, options),
			classDataOffset,
			encodedStaticValuesOffset: view.u32(offset + 28, "class static values offset"),
			index,
			interfaces: readDexTypeList(
				view,
				interfacesOffset,
				pools.types,
				`class ${index} interfaces`
			),
			sourceFile: dexIndex(
				pools.strings,
				sourceIndex,
				`class ${index} source`,
				{ allowNoIndex: true }
			),
			superType: dexIndex(
				pools.types,
				view.u32(offset + 8, "class super index"),
				`class ${index} super`,
				{ allowNoIndex: true }
			),
			type
		}));
	}
	return Object.freeze(output);
}
