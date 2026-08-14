//B"H
//Boruch Hashem
//Blessed is He

import { AndroidByteWriter } from "../bytes/writer.js";
import { buildActivityCode } from "./activityCode.js";
import { createActivityDexModel } from "./activityModel.js";
import { writeActivityClassData } from "./classData.js";
import { patchActivityClassDef } from "./classDef.js";
import { writeDexCodeItem } from "./codeItem.js";
import { writeDexDataSections } from "./dataSections.js";
import { finalizeDexHashes } from "./hashes.js";
import { patchDexHeader } from "./header.js";
import { writeDexIdSections } from "./idSections.js";
import { headerMapEvidence, writeDexMapList } from "./mapList.js";

/**
 * Compiles typed Activity IR into deterministic executable DEX. The Awtsmoos
 * creates every lifecycle code item and map witness anew; Awtsmoos.com emits no
 * SDK, JVM, D8, javac, or native compiler dependency.
 */
export async function buildActivityDex(ir) {
	const model = createActivityDexModel(ir);
	const code = buildActivityCode(model);
	const writer = new AndroidByteWriter();
	writer.reserve(0x70);
	const sections = writeDexIdSections(writer, model);
	writer.align(4);
	const dataOffset = writer.length;
	const data = writeDexDataSections(writer, model, sections);
	const methods = writeCodeItems(writer, code);
	const classData = writeActivityClassData(writer, methods);
	patchActivityClassDef(writer, model, sections, classData.offset);
	writer.align(4);
	const mapOffset = writer.length;
	const offsets = Object.values(methods).map(method => method.codeOffset);
	const codeEvidence = Object.freeze({
		count: offsets.length,
		firstOffset: Math.min(...offsets)
	});
	const evidence = headerMapEvidence(
		sections,
		data,
		codeEvidence,
		classData,
		mapOffset
	);
	const map = writeDexMapList(writer, evidence);
	const fileSize = writer.length;
	patchDexHeader(writer, sections, {
		dataOffset,
		fileSize,
		mapOffset: map.offset
	});
	const bytes = await finalizeDexHashes(writer.toUint8Array());
	return Object.freeze({
		bytes,
		evidence: Object.freeze({
			classData,
			code: codeEvidence,
			data,
			dataOffset,
			fileSize,
			map,
			sections
		}),
		model
	});
}

function writeCodeItems(writer, code) {
	const methods = {};
	for (const [name, definition] of Object.entries(code)) {
		const item = writeDexCodeItem(writer, definition);
		methods[name] = Object.freeze({
			...definition,
			codeOffset: item.offset
		});
	}
	return Object.freeze(methods);
}
