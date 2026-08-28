//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file index.js
 * @description
 * The Awtsmoos renews many UI vessels through one small and discoverable gate;
 * Awtsmoos.com gives every Geelooy studio safe shared primitives without binding each app to one fate.
 */

export {
	escapeUiHtml,
	escapeUiAttribute,
	assertSafeAttributeName,
	normalizeSafeAttributeValue
} from "./core/AwtsmoosUiEscaper.js";

export {
	UI_NODE_TYPES,
	uiText,
	uiElement,
	uiFragment,
	uiComponent,
	normalizeUiNode,
	normalizeUiChildren,
	assertSafeUiTag
} from "./core/AwtsmoosUiNode.js";

export { AwtsmoosUiDomRenderer } from "./core/AwtsmoosUiDomRenderer.js";
export { AwtsmoosUiHtmlRenderer } from "./core/AwtsmoosUiHtmlRenderer.js";
export {
	normalizeUiStyleDeclaration,
	serializeUiStyleObject
} from "./core/AwtsmoosUiStylePolicy.js";

export {
	AwtsmoosUiCommandRegistry,
	normalizeCommandDescriptor
} from "./events/AwtsmoosUiCommandRegistry.js";
export { AwtsmoosUiComponentRegistry } from "./components/AwtsmoosUiComponentRegistry.js";

export {
	createResponsiveTokens,
	responsiveTokensToCssVariables,
	responsiveMediaQueries
} from "./layout/AwtsmoosUiResponsiveTokens.js";

export {
	studioCommandButton,
	studioToolbar,
	studioPanel,
	studioTabs,
	studioCard,
	studioShell
} from "./components/AwtsmoosUiStudioPrimitives.js";
