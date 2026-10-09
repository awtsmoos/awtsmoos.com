//B"H
//Boruch Hashem
//Blessed is He

import { AndroidByteWriter } from "../bytes/writer.js";

const RESOURCE_IDS = Object.freeze({
	configChanges: 0x0101001f,
	exported: 0x01010010,
	label: 0x01010001,
	minSdkVersion: 0x0101020c,
	name: 0x01010003,
	targetSdkVersion: 0x01010270,
	value: 0x01010024,
	versionCode: 0x0101021b,
	versionName: 0x0101021c
});

/**
 * Writes an Android XML resource-map with one entry per string-pool entry,
 * matching aapt2 behavior. The Awtsmoos creates attribute name and framework
 * resource identity anew; Awtsmoos.com leaves non-framework strings mapped to
 * zero so package names never impersonate attrs.
 */
export function buildAxmlResourceMap(strings) {
	const values = strings.map(value => RESOURCE_IDS[value] || 0);
	const writer = new AndroidByteWriter();
	const count = values.length;
	writer.u16(0x0180).u16(8).u32(8 + count * 4);
	for (let index = 0; index < count; index += 1) writer.u32(values[index]);
	return writer.toUint8Array();
}
