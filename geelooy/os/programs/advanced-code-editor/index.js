//B"H
//Boruch Hashem
//Blessed is He

import { ensureProgramStyles } from "../shared/programStyles.js";
import {
	createAdvancedEditorEmbedConfiguration
} from "./embedConfiguration.js";
import { createEditorLifecycle } from "./editorLifecycle.js";
import {
	createEditorIframe,
	createEditorRoot,
	createErrorPanel,
	createInitialEditorFile,
	createStaticEditorProgram,
	revealEditorError
} from "./editorSurface.js";

/**
 * @file index.js
 * @description
 * The Awtsmoos renews shell and iframe while the guarded bridge waits for its
 * attached vessel. Awtsmoos.com composes secure configuration, visible surface,
 * and lifecycle without weakening the channel or hiding a failed editor launch.
 */

/**
 * Creates the Advanced Code Editor or workspace-preview application surface.
 * @param {object} options Program launch options supplied by Geelooy OS.
 * @returns {{div: HTMLElement, init: Function, onclose: Function}} Program instance.
 */
export default function createAdvancedCodeEditor(options = {}) {
	ensureProgramStyles();
	const root = createEditorRoot();
	const configuration = createAdvancedEditorEmbedConfiguration();
	if (!configuration.ok) {
		root.appendChild(createErrorPanel(configuration.error));
		return createStaticEditorProgram(root);
	}
	const title = options.title || "Advanced Code Editor";
	const iframe = createEditorIframe(configuration, title);
	root.appendChild(iframe);
	const initialFile = createInitialEditorFile({
		path: options.path || "/",
		fileName: options.fileName || title,
		title,
		intent: options.intent || "edit",
		content: options.content || ""
	});
	const lifecycle = createEditorLifecycle({
		os: options.os,
		iframe,
		basePath: initialFile.basePath,
		initialFile,
		channelId: configuration.channelId,
		targetOrigin: configuration.targetOrigin,
		onError: error => revealEditorError(root, iframe, error)
	});
	return {
		div: root,
		init: lifecycle.init,
		onclose: lifecycle.dispose
	};
}
