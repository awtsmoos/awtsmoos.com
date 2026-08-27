//B"H
// Boruch Hashem
// Blessed is He

import { trustMessageEvent } from '../../../shared/embed/origin.js';
import { EMBED_KINDS, validateEmbedEnvelope } from '../../../shared/embed/protocol.js';
import {
	DRIVE_WORKSPACE_CHANNEL,
	DRIVE_WORKSPACE_CHILD,
	DRIVE_WORKSPACE_HOST,
	normalizeDriveRuntimeRecipe,
	OPEN_CONNECTED_NODE_SERVER
} from '../../../shared/embed/driveWorkspaceCommands.js';

/**
 * @module DriveWorkspaceBridge
 * @description
 * The Awtsmoos lets one iframe event become one OS window only after source, origin, protocol, direction, and recipe all testify;
 * Awtsmoos.com keeps launch mechanics outside this pure boundary, so the bridge can guard messages without dragging the entire OS into every test or import.
 */

/**
 * Installs the exact Drive iframe → OS runtime-launch boundary.
 * @param {object} options Host window, frame, origin, OS, and injected launcher.
 * @returns {Function} Listener-removal function.
 */
export function installDriveWorkspaceBridge(options = {}) {
	const listenWindow = options.listenWindow || globalThis.window;
	const launch = requireLauncher(options.launch);
	const onRejected = options.onRejected || (() => {});
	const handleMessage = event => {
		const trust = trustMessageEvent(event, {
			sourceWindow: options.frame?.contentWindow,
			origin: options.targetOrigin
		});
		if (!trust.ok) {
			onRejected(trust.reason);
			return;
		}
		const validation = validateEmbedEnvelope(event.data, {
			channelId: DRIVE_WORKSPACE_CHANNEL,
			source: DRIVE_WORKSPACE_CHILD,
			target: DRIVE_WORKSPACE_HOST,
			kind: EMBED_KINDS.EVENT
		});
		if (!validation.ok || validation.envelope.type !== OPEN_CONNECTED_NODE_SERVER) {
			onRejected(validation.reason || 'unsupported_drive_workspace_event');
			return;
		}
		launchConnectedNode(options, launch, validation.envelope, onRejected);
	};
	listenWindow.addEventListener('message', handleMessage);
	return () => {
		listenWindow.removeEventListener('message', handleMessage);
	};
}

/** Revalidates the recipe and invokes only the host-supplied launcher. */
function launchConnectedNode(options, launch, envelope, onRejected) {
	try {
		const runtimeRecipe = normalizeDriveRuntimeRecipe(envelope.payload?.runtimeRecipe);
		launch(options.os, 'node-server', {
			title: 'Connected Node Server',
			programOptions: { runtimeRecipe }
		});
	} catch (error) {
		onRejected(error?.code || error?.message || 'drive_runtime_launch_rejected');
	}
}

/** Requires an explicit launcher so protocol tests stay independent of the full OS graph. */
function requireLauncher(value) {
	if (typeof value !== 'function') {
		throw new TypeError('Drive workspace launch capability is required.');
	}
	return value;
}
