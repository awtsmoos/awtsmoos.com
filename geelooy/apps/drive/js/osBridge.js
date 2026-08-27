//B"H
// Boruch Hashem
// Blessed is He

import { sameOriginParentOrigin } from '../../../shared/embed/origin.js';
import { createEmbedEnvelope, EMBED_KINDS } from '../../../shared/embed/protocol.js';
import {
	DRIVE_WORKSPACE_CHANNEL,
	DRIVE_WORKSPACE_CHILD,
	DRIVE_WORKSPACE_HOST,
	normalizeDriveRuntimeRecipe,
	OPEN_CONNECTED_NODE_SERVER
} from '../../../shared/embed/driveWorkspaceCommands.js';

/**
 * @module DriveOsBridge
 * @description
 * The Awtsmoos lets embedded Drive speak one exact request into its Geelooy OS parent;
 * Awtsmoos.com proves same-origin parenthood first, then sends only a fixed event and revalidated recipe through the versioned covenant.
 */

/** Emits one native-compute launch event only from a proven OS embed. */
export function openConnectedNodeServer(runtimeRecipe, options = {}) {
	const windowObject = options.windowObject || globalThis.window;
	const documentObject = options.documentObject || globalThis.document;
	const locationObject = options.locationObject || windowObject?.location;
	const parentOrigin = sameOriginParentOrigin(locationObject, documentObject);
	const parameters = new URLSearchParams(locationObject?.search || '');
	if (!osEmbedding(parameters) || !parentOrigin || windowObject?.parent === windowObject) {
		return { ok: false, reason: 'geelooy_os_embed_required' };
	}
	if (parameters.get('embedParentOrigin') !== parentOrigin) {
		return { ok: false, reason: 'embed_parent_origin_mismatch' };
	}
	const recipe = normalizeDriveRuntimeRecipe(runtimeRecipe);
	windowObject.parent.postMessage(createEmbedEnvelope({
		channelId: DRIVE_WORKSPACE_CHANNEL,
		kind: EMBED_KINDS.EVENT,
		type: OPEN_CONNECTED_NODE_SERVER,
		source: DRIVE_WORKSPACE_CHILD,
		target: DRIVE_WORKSPACE_HOST,
		payload: { runtimeRecipe: recipe }
	}), parentOrigin);
	return { ok: true };
}

function osEmbedding(parameters) {
	return parameters.get('embed') === 'awtsmoos-os'
		&& parameters.get('embedParent') === 'geelooy-os';
}
