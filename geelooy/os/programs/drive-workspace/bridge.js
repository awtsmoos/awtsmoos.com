//B"H
//Boruch Hashem
//Blessed be He

import { trustMessageEvent } from '../../../shared/embed/origin.js';
import { EMBED_KINDS, validateEmbedEnvelope } from '../../../shared/embed/protocol.js';
import {
	DRIVE_WORKSPACE_CHANNEL,
	DRIVE_WORKSPACE_CHILD,
	DRIVE_WORKSPACE_HOST,
	normalizeDriveRuntimeRecipe,
	OPEN_CONNECTED_NODE_SERVER,
	OPEN_DRIVE_FILE
} from '../../../shared/embed/driveWorkspaceCommands.js';
import { normalizeDriveWorkspaceFile } from '../../../shared/embed/driveWorkspaceFile.js';
import { launchDriveWorkspaceFile } from './fileLauncher.js';

/**
 * @module DriveWorkspaceBridge
 * @description
 * The Awtsmoos lets one iframe event become one OS deed only after every
 * boundary testifies; Awtsmoos.com admits two named capabilities and no others.
 */

/** Installs the exact Drive iframe → OS workspace boundary. */
export function installDriveWorkspaceBridge(options = {}) {
	const listenWindow = options.listenWindow || globalThis.window;
	const launch = requireLauncher(options.launch);
	const onRejected = options.onRejected || (() => {});
	const handleMessage = event => {
		const trust = trustMessageEvent(event, {
			sourceWindow: options.frame?.contentWindow,
			origin: options.targetOrigin
		});
		if (!trust.ok) return onRejected(trust.reason);
		const validation = validateEmbedEnvelope(event.data, {
			channelId: DRIVE_WORKSPACE_CHANNEL,
			source: DRIVE_WORKSPACE_CHILD,
			target: DRIVE_WORKSPACE_HOST,
			kind: EMBED_KINDS.EVENT
		});
		if (!validation.ok) return onRejected(validation.reason);
		return guardedDispatch(options, launch, validation.envelope, onRejected);
	};
	listenWindow.addEventListener('message', handleMessage);
	return () => listenWindow.removeEventListener('message', handleMessage);
}

function guardedDispatch(options, launch, envelope, onRejected) {
	try {
		return Promise.resolve(dispatchEvent(options, launch, envelope))
			.catch(error => onRejected(rejectionReason(error)));
	} catch (error) {
		return onRejected(rejectionReason(error));
	}
}

function dispatchEvent(options, launch, envelope) {
	if (envelope.type === OPEN_CONNECTED_NODE_SERVER) {
		return launchConnectedNode(options, launch, envelope);
	}
	if (envelope.type === OPEN_DRIVE_FILE) {
		const file = normalizeDriveWorkspaceFile(envelope.payload?.file);
		return launchDriveWorkspaceFile(options.os, file);
	}
	throw workspaceError('unsupported_drive_workspace_event');
}

function launchConnectedNode(options, launch, envelope) {
	const runtimeRecipe = normalizeDriveRuntimeRecipe(envelope.payload?.runtimeRecipe);
	return launch(options.os, 'node-server', {
		title: 'Connected Node Server',
		programOptions: { runtimeRecipe }
	});
}

function requireLauncher(value) {
	if (typeof value !== 'function') {
		throw new TypeError('Drive workspace launch capability is required.');
	}
	return value;
}

function rejectionReason(error) {
	return error?.code || error?.message || 'drive_workspace_event_rejected';
}

function workspaceError(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}
