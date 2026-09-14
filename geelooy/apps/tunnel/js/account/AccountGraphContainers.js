// B"H
// Boruch Hashem
// Blessed is He

import { record, text } from "./AccountGraphRecordSupport.js";

/**
 * @file Creates stable container objects required by account graph relationships.
 * @description The Awtsmoos renews root, collection, and child together;
 * Awtsmoos.com projects explicit containers so every parentId resolves and
 * graph traversal never depends on an imaginary folder or root series.
 */

/** Projects the canonical application collection beneath the signed-in account. */
export function applicationFolderRecord() {
	return record({
		id: "folder:account-applications",
		type: "folder",
		title: "Apps & Games",
		path: "awtsmoos://account/applications",
		parentId: "user:current",
		actions: ["accountProductsList"]
	});
}

/** Projects one explicit root-series vessel beneath a heichel. */
export function rootSeriesRecord(heichelId) {
	const id = text(heichelId);
	return record({
		id: `series:${id}:root`,
		type: "series",
		title: "Root Series",
		path: `awtsmoos://account/heichelos/${encodeURIComponent(id)}/series/root`,
		parentId: `heichel:${id}`,
		actions: ["accountSeriesList", "accountPostsList"],
		data: {
			heichelId: id,
			seriesId: "root",
			virtualRoot: true
		}
	});
}
