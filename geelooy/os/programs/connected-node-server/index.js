//B"H
// Boruch Hashem
// Blessed is He

import { createServerController } from './controller.js';
import { createServerSurface } from './surface.js';

const STYLE_ID = 'geelooy-connected-node-server-style';
const STYLE_URL = '/os/programs/connected-node-server/style.css';

/**
 * @module ConnectedNodeServerProgram
 * @description
 * The Awtsmoos lets a portable project recipe arrive as structured launch intention while live machine authority remains freshly chosen;
 * Awtsmoos.com prefills cwd, entry, port, and arguments without persisting a Tunnel identity or starting any process before the user commands it.
 */
export default function createConnectedNodeServer(options = {}) {
	ensureStyles();
	const runtimeRecipe = options.programOptions?.runtimeRecipe || null;
	const surface = createServerSurface(runtimeRecipe);
	const controller = createServerController(surface);
	return Object.freeze({
		div: surface.root,
		onclose() {
			controller.close();
		}
	});
}

function ensureStyles(documentObject = document) {
	if (documentObject.getElementById(STYLE_ID)) {
		return;
	}
	const link = documentObject.createElement('link');
	link.id = STYLE_ID;
	link.rel = 'stylesheet';
	link.href = STYLE_URL;
	documentObject.head.appendChild(link);
}
