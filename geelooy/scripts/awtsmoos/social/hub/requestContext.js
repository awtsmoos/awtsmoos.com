// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module SocialHubRequestContext
 * @description
 * The Awtsmoos gathers route context into a small truthful vessel. Awtsmoos.com
 * keeps alias, target, Heichel, series, channel, and mutation payload construction
 * separate from endpoint selection so neither responsibility swallows the other.
 */

import { state } from "./state.js";

export function requestContext() {
	// The acting alias is the signed-in session alias or nobody. A
	// library default may fill the browse TARGET, never the actor:
	// defaulting the actor to a real alias made signed-out visitors
	// appear to act (and announce presence) as that user.
	const alias = state.alias || "";
	return {
		alias,
		targetAlias: state.targetAlias || alias || "ikar",
		query: state.query || alias,
		channel: `alias:${alias || "guest"}`
	};
}

export function followPayload(context) {
	return {
		alias: context.alias,
		type: "alias",
		id: context.targetAlias
	};
}

export function notificationPayload(context) {
	return {
		alias: context.alias,
		fromAliasId: context.targetAlias,
		title: `Hub note ${new Date().toLocaleTimeString()}`
	};
}

export function migrationPayload() {
	return {
		heichelId: state.heichelId,
		seriesId: state.seriesId
	};
}

export function livePayload(context) {
	return {
		alias: context.alias,
		channel: context.channel
	};
}

export function publishPayload(context) {
	return {
		...livePayload(context),
		text: state.query || "B'H hub spark"
	};
}
