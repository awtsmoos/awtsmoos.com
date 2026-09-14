//B"H
//Boruch Hashem
//Blessed be He

import { sameOriginParentOrigin } from '../../../shared/embed/origin.js';
import { createEmbedEnvelope, EMBED_KINDS } from '../../../shared/embed/protocol.js';
import {
	DRIVE_WORKSPACE_CHANNEL,
	DRIVE_WORKSPACE_CHILD,
	DRIVE_WORKSPACE_HOST,
	normalizeDriveRuntimeRecipe,
	OPEN_CONNECTED_NODE_SERVER,
	OPEN_DRIVE_FILE
} from '../../../shared/embed/driveWorkspaceCommands.js';
import { normalizeDriveWorkspaceFile } from '../../../shared/embed/driveWorkspaceFile.js';

/**
 * @module DriveOsBridge
 * @description
 * The Awtsmoos lets private bytes and native recipes cross only one proven
 * same-origin bridge; Awtsmoos.com transfers testimony, never credentials.
 */

/** Returns whether Drive is running inside its exact same-origin Geelooy OS parent. */
export function canUseDriveWorkspaceBridge(options = {}) {
	return bridgeContext(options).ok;
}

/** Emits one native-compute launch event from a proven OS embed. */
export function openConnectedNodeServer(runtimeRecipe, options = {}) {
	const recipe = normalizeDriveRuntimeRecipe(runtimeRecipe);
	return publishEvent(OPEN_CONNECTED_NODE_SERVER, { runtimeRecipe: recipe }, [], options);
}

/** Emits one bounded private-file testimony event and transfers its byte buffer. */
export function openDriveFile(fileValue, options = {}) {
	const file = normalizeDriveWorkspaceFile(fileValue);
	return publishEvent(OPEN_DRIVE_FILE, { file }, [file.content], options);
}

function publishEvent(type, payload, transfer, options) {
	const context = bridgeContext(options);
	if (!context.ok) return context;
	const envelope = createEmbedEnvelope({
		channelId: DRIVE_WORKSPACE_CHANNEL,
		kind: EMBED_KINDS.EVENT,
		type,
		source: DRIVE_WORKSPACE_CHILD,
		target: DRIVE_WORKSPACE_HOST,
		payload
	});
	context.windowObject.parent.postMessage(envelope, context.parentOrigin, transfer);
	return { ok: true };
}

function bridgeContext(options = {}) {
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
	return { ok: true, parentOrigin, windowObject };
}

function osEmbedding(parameters) {
	return parameters.get('embed') === 'awtsmoos-os'
		&& parameters.get('embedParent') === 'geelooy-os';
}
