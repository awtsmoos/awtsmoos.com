//B"H
// Boruch Hashem
// Blessed is He

import { launchApp } from '../../shell/appLauncher.js';
import { ensureProgramStyles } from '../shared/programStyles.js';
import { installDriveWorkspaceBridge } from './bridge.js';
import { createDriveWorkspaceEmbedConfiguration } from './embedConfiguration.js';

/**
 * @file Native Geelooy OS host for Apps Drive.
 * @description
 * The Awtsmoos makes folder, publication, project cockpit, and connected compute one visible chamber;
 * Awtsmoos.com owns the heavy OS launcher here while the child-message bridge remains a pure guarded vessel that can be verified alone.
 */

/**
 * Creates the bounded Drive & Sites workspace program.
 * @param {object} options Geelooy OS and window metadata.
 * @returns {object} Program window contract.
 */
export default function createDriveWorkspace(options = {}) {
	ensureProgramStyles();
	const root = createRoot(options.title || 'Drive & Sites');
	const configuration = createDriveWorkspaceEmbedConfiguration();
	if (!configuration.ok) {
		root.append(createError(configuration.error));
		return unavailableProgram(root);
	}
	const frame = createDriveFrame(configuration, options.title);
	const removeBridge = installDriveWorkspaceBridge({
		frame,
		launch: launchApp,
		os: options.os,
		targetOrigin: configuration.targetOrigin
	});
	root.append(frame);
	return {
		div: root,
		onclose() {
			removeBridge();
			frame.src = 'about:blank';
		}
	};
}

/** Creates the same-origin sandboxed Drive iframe. */
function createDriveFrame(configuration, title) {
	const frame = document.createElement('iframe');
	frame.className = 'awtsmoos-program-frame';
	frame.src = configuration.url;
	frame.title = title || 'Drive & Sites';
	frame.setAttribute('sandbox', configuration.sandbox);
	frame.allow = configuration.allow;
	frame.referrerPolicy = 'strict-origin';
	return frame;
}

/** Creates the host frame and visible target testimony. */
function createRoot(title) {
	const root = document.createElement('section');
	root.className = 'awtsmoos-program-host awtsmoos-drive-workspace-host';
	const toolbar = document.createElement('header');
	toolbar.className = 'awtsmoos-program-toolbar';
	const heading = document.createElement('strong');
	heading.textContent = title;
	const truth = document.createElement('span');
	truth.className = 'awtsmoos-target-chip';
	truth.textContent = 'Files · named sites · project publication · connected compute';
	toolbar.append(heading, truth);
	root.append(toolbar);
	return root;
}

/** Creates an explicit unavailable-state panel. */
function createError(message) {
	const panel = document.createElement('div');
	panel.setAttribute('role', 'alert');
	panel.textContent = message || 'Drive workspace unavailable';
	return panel;
}

/** Returns a no-op lifecycle without compressed anonymous functions. */
function unavailableProgram(root) {
	return {
		div: root,
		onclose() {
			return undefined;
		}
	};
}
