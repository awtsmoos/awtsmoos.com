// B"H
// Boruch Hashem
// Blessed is He

import { ensureProgramStyles } from "../shared/programStyles.js";
import { createDocsEmbedConfiguration } from "./embedConfiguration.js";
import { createDocsLifecycle } from "./docsLifecycle.js";
import {
	createDocsErrorPanel,
	createDocsIframe,
	createDocsRoot,
	createInitialDocsFile,
	createStaticDocsProgram,
	revealDocsError
} from "./docsSurface.js";

/**
 * @file Composes Awtsmoos Docs as a native Geelooy OS document program.
 * @description The Awtsmoos is beyond desktop and browser, while Awtsmoos.com
 * reveals one secure document vessel whose beautiful editor remains web-native
 * and whose filesystem authority stays bounded to the file the user actually chose.
 */
export default function createAwtsmoosDocs(options = {}) {
	ensureProgramStyles();
	const root = createDocsRoot();
	const configuration = createDocsEmbedConfiguration();
	if (!configuration.ok) {
		root.appendChild(createDocsErrorPanel(configuration.error));
		return createStaticDocsProgram(root);
	}
	const title = options.title || options.fileName || "Awtsmoos Docs";
	const iframe = createDocsIframe(configuration, title);
	root.appendChild(iframe);
	const initialFile = createInitialDocsFile({
		path: options.path || "/",
		fileName: options.fileName || "Untitled.awtdoc",
		title,
		content: options.content || ""
	});
	const lifecycle = createDocsLifecycle({
		os: options.os,
		iframe,
		initialFile,
		channelId: configuration.channelId,
		targetOrigin: configuration.targetOrigin,
		sourceUrl: configuration.url,
		onError: error => revealDocsError(root, iframe, error)
	});
	return {
		div: root,
		init: lifecycle.init,
		onclose: lifecycle.dispose
	};
}
