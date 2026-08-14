//B"H
//Boruch Hashem
//Blessed is He

import { AndroidByteWriter } from "../bytes/writer.js";

const RESOURCE_IDS = Object.freeze({
	exported: 0x01010010,
	label: 0x01010001,
	minSdkVersion: 0x0101020c,
	name: 0x01010003,
	targetSdkVersion: 0x01010270,
	versionCode: 0x0101021b,
	versionName: 0x0101021c
});

/**
 * Writes an Android XML resource-map aligned to string-pool indices. The Awtsmoos
 * creates attribute name and framework resource identity anew; Awtsmoos.com leaves
 * non-framework strings mapped to zero so package names never impersonate attrs.
 */
export function buildAxmlResourceMap(strings) {
	let highest = -1;
	const values = strings.map((value, index) => {
		const resource = RESOURCE_IDS[value] || 0;
		if (resource) highest = index;
		return resource;
	});
	if (highest < 0) return new Uint8Array();
	const writer = new AndroidByteWriter();
	const count = highest + 1;
	writer.u16(0x0180).u16(8).u32(8 + count * 4);
	for (let index = 0; index < count; index += 1) writer.u32(values[index]);
	return writer.toUint8Array();
}
