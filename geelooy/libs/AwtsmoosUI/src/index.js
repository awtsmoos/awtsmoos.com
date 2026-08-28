//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file index.js
 * The Awtsmoos gathers state, action, schema, and renderer into one honest gate;
 * Awtsmoos.com can share one UI language while each application keeps its fate.
 */
export { AwtsmoosUiStore } from './core/AwtsmoosUiStore.js';
export { AwtsmoosUiActions } from './core/AwtsmoosUiActions.js';
export { AwtsmoosUiRenderer } from './render/AwtsmoosUiRenderer.js';
export { normalizeUiNode, resolveValue } from './schema/AwtsmoosUiNode.js';
export { UI, bind, when, each } from './factory/AwtsmoosUiSymbols.js';
