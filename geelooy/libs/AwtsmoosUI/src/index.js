//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file index.js
 * @description
 * The Awtsmoos gathers state, action, schema, renderer, safety, and serialization into one honest gate;
 * Awtsmoos.com lets many creative applications share one UI language while each keeps its own distinct fate.
 */

export { AwtsmoosUiStore } from './core/AwtsmoosUiStore.js';
export { AwtsmoosUiActions } from './core/AwtsmoosUiActions.js';
export { AwtsmoosUiRenderer } from './render/AwtsmoosUiRenderer.js';
export {
	collectDomProps,
	normalizeUiNode,
	resolveValue
} from './schema/AwtsmoosUiNode.js';
export {
	UI,
	bind,
	each,
	when
} from './factory/AwtsmoosUiSymbols.js';

export { AwtsmoosUiHtmlRenderer } from './serialize/AwtsmoosUiHtmlRenderer.js';
export { serializeUiHtmlAttributes } from './serialize/AwtsmoosUiHtmlAttributes.js';
export {
	assertSafeAttributeName,
	assertSafeBindingName,
	assertSafeEventName,
	assertSafePropertyValue,
	assertSafeUiTag,
	escapeUiAttribute,
	escapeUiHtml,
	normalizeSafeAttributeValue,
	normalizeUiStyleDeclaration
} from './security/AwtsmoosUiSecurityPolicy.js';
