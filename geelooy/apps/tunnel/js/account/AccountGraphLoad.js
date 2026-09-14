// B"H
// Boruch Hashem
// Blessed is He

import {
	accountAliasesList,
	accountDefaultAlias,
	accountHeichelosList
} from "./AccountIdentity.js";
import { accountDocumentsList } from "./AccountDocuments.js";
import { accountPostsList } from "./AccountPosts.js";
import { accountProductsList } from "./AccountProducts.js";
import { accountSeriesList } from "./AccountSeries.js";
import {
	accountResultList,
	unwrapAccountResult
} from "./AccountResult.js";

/**
 * @file Loads bounded signed-in account data for Virtual OS graph projection.
 * @description The Awtsmoos renews every account vessel while Awtsmoos.com isolates
 * failures by scope, so one unavailable Drive folder or heichel does not erase the
 * remaining account graph and callers receive explicit partial-error testimony.
 */

/** Loads account identities, products, heichel metadata, documents, and optional root content. */
export async function loadAccountGraphData(input = {}) {
	const errors = [];
	const [aliasReply, defaultReply] = await Promise.all([
		attempt("aliases", accountAliasesList, errors),
		attempt("defaultAlias", accountDefaultAlias, errors)
	]);
	const aliases = accountResultList(aliasReply);
	const scopes = await Promise.all(
		aliases.map(alias => loadAliasScope(alias, input, errors))
	);
	return {
		aliases,
		defaultAlias: unwrapAccountResult(defaultReply),
		products: accountProductsList(),
		scopes,
		errors
	};
}

async function loadAliasScope(alias, input, errors) {
	const aliasId = aliasIdentity(alias);
	if (!aliasId) {
		errors.push({ scope: "alias", code: "missing_alias_id" });
		return { alias, aliasId: "", heichels: [], documents: [], content: [] };
	}
	const [heichelReply, documentReply] = await Promise.all([
		attempt(`heichelos:${aliasId}`, () => accountHeichelosList(aliasId), errors),
		attempt(`documents:${aliasId}`, () => accountDocumentsList({
			aliasId,
			path: input.documentPath || "Documents",
			limit: input.documentLimit || 100
		}), errors)
	]);
	const heichels = accountResultList(heichelReply);
	const content = input.includeContent
		? await Promise.all(heichels.map(value => loadHeichelContent(value, errors)))
		: [];
	return {
		alias,
		aliasId,
		heichels,
		documents: accountResultList(documentReply),
		content
	};
}

async function loadHeichelContent(heichel, errors) {
	const heichelId = heichelIdentity(heichel);
	if (!heichelId) return { heichelId: "", series: [], posts: [] };
	const [seriesReply, postReply] = await Promise.all([
		attempt(`series:${heichelId}`, () => accountSeriesList({ heichelId }), errors),
		attempt(`posts:${heichelId}`, () => accountPostsList({ heichelId, seriesId: "root" }), errors)
	]);
	return {
		heichelId,
		series: accountResultList(seriesReply),
		posts: accountResultList(postReply)
	};
}

async function attempt(scope, work, errors) {
	try {
		return await work();
	} catch (error) {
		errors.push({
			scope,
			code: error?.code || "account_graph_load_failed",
			message: error?.message || String(error)
		});
		return null;
	}
}

function aliasIdentity(value) {
	if (typeof value === "string") return value;
	return String(value?.aliasId || value?.id || "").trim();
}

function heichelIdentity(value) {
	if (typeof value === "string") return value;
	return String(value?.heichelId || value?.id || "").trim();
}
