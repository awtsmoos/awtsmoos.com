// B"H
// Boruch Hashem
// Blessed is He

import {
	baseName,
	objectData,
	record,
	scalarId,
	text
} from "./AccountGraphRecordSupport.js";

/**
 * @file Projects account API records into stable Virtual OS graph objects.
 * @description The Awtsmoos renews identity beneath alias, heichel, series, post,
 * document, and application; Awtsmoos.com assigns deterministic graph IDs and paths
 * so refreshes update one object instead of multiplying duplicate shadows.
 */

/** Projects the signed-in account root. */
export function accountRootRecord(defaultAlias = "") {
	return record({
		id: "user:current",
		type: "user",
		title: "Signed-in Awtsmoos Account",
		path: "awtsmoos://account",
		data: { defaultAlias: scalarId(defaultAlias) }
	});
}

/** Projects one alias identity beneath the signed-in account. */
export function aliasGraphRecord(value) {
	const id = scalarId(value, ["aliasId", "id"]);
	return record({
		id: `alias:${id}`,
		type: "alias",
		title: text(value?.name || value?.aliasName || id),
		path: `awtsmoos://account/aliases/${encodeURIComponent(id)}`,
		parentId: "user:current",
		data: objectData(value, { aliasId: id })
	});
}

/** Projects one heichel beneath its owning alias. */
export function heichelGraphRecord(aliasId, value) {
	const id = scalarId(value, ["heichelId", "id"]);
	return record({
		id: `heichel:${id}`,
		type: "heichel",
		title: text(value?.name || value?.title || id),
		path: `awtsmoos://account/heichelos/${encodeURIComponent(id)}`,
		parentId: `alias:${aliasId}`,
		data: objectData(value, { heichelId: id, aliasId })
	});
}

/** Projects one series beneath its heichel. */
export function seriesGraphRecord(heichelId, value) {
	const id = scalarId(value, ["seriesId", "id"]);
	return record({
		id: `series:${heichelId}:${id}`,
		type: "series",
		title: text(value?.name || value?.title || id),
		path: `awtsmoos://account/heichelos/${encodeURIComponent(heichelId)}/series/${encodeURIComponent(id)}`,
		parentId: `heichel:${heichelId}`,
		data: objectData(value, { heichelId, seriesId: id })
	});
}

/** Projects one post beneath its exact series when known. */
export function postGraphRecord(heichelId, seriesId, value) {
	const id = scalarId(value, ["postId", "id"]);
	return record({
		id: `post:${heichelId}:${id}`,
		type: "post",
		title: text(value?.title || id),
		path: `awtsmoos://account/heichelos/${encodeURIComponent(heichelId)}/posts/${encodeURIComponent(id)}`,
		parentId: `series:${heichelId}:${seriesId || "root"}`,
		data: objectData(value, { heichelId, seriesId: seriesId || "root", postId: id })
	});
}

/** Projects one Drive-backed Docs document beneath its owning alias. */
export function documentGraphRecord(aliasId, value) {
	const path = text(value?.path || value?.name || value?.id || "document.awtdoc");
	return record({
		id: `document:${aliasId}:${encodeURIComponent(path)}`,
		type: "document",
		title: text(value?.title || baseName(path)),
		path: `awtsmoos://account/documents/${encodeURIComponent(aliasId)}/${encodeURIComponent(path)}`,
		parentId: `alias:${aliasId}`,
		data: objectData(value, { aliasId, path })
	});
}

/** Projects one canonical public app or game beneath the account application crown. */
export function productGraphRecord(value = {}) {
	const id = scalarId(value, ["id"]);
	return record({
		id: `application:${id}`,
		type: "application",
		title: text(value.title || id),
		path: `awtsmoos://account/applications/${encodeURIComponent(id)}`,
		parentId: "folder:account-applications",
		data: objectData(value, { productId: id })
	});
}
