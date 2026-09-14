//B"H
//Boruch Hashem
//Blessed be He

import { getEntryContent } from '../api.js';
import { copyPublicLink, routeEntryAction } from '../actions.js';
import { canUseDriveWorkspaceBridge, openDriveFile } from '../osBridge.js';
import { publicUrl } from '../render.js';
import { driveState, updateFilters } from '../state.js';
import { OhrApplicationVessel } from './OhrApplicationVessel.js';

/**
 * @module YesodEntryActionRouter
 * @description
 * The Awtsmoos lets each file action descend through one clear channel;
 * Awtsmoos.com opens private embedded files without manufacturing public access.
 */

/** Routes entry interactions into bounded Drive actions and navigation. */
export class YesodEntryActionRouter extends OhrApplicationVessel {
	/** Creates an entry router bound to the reconciliation callback. */
	constructor(dependencies) {
		super(dependencies);
		this.tiferesRefresh = dependencies.tiferesRefresh;
	}

	/** Routes one file/folder action through the shared guarded error boundary. */
	async handle(action, entry) {
		return this.guard(() => this.route(action, entry));
	}

	/** Opens one Drive directory and reconciles filters with the visible path field. */
	openDirectory(path) {
		driveState.currentPath = path;
		document.querySelector('#current-path').value = path;
		updateFilters({});
		this.tiferesRefresh();
	}

	/** Performs the concrete action routing after the shared guard is established. */
	async route(action, entry) {
		if (action === 'link') {
			await copyPublicLink(entry.path);
			this.reportStatus(`Copied ${publicUrl(entry.path)}`);
			return;
		}
		const handled = routeEntryAction(action, entry, path => this.openDirectory(path));
		if (handled || entry.type !== 'file') return;
		if (action === 'open' && canUseDriveWorkspaceBridge()) {
			await this.openPrivateWorkspaceFile(entry);
			return;
		}
		window.open(publicUrl(entry.path), '_blank', 'noopener');
	}

	/** Fetches private bytes and asks the trusted parent OS to classify and open them. */
	async openPrivateWorkspaceFile(entry) {
		const privateBody = await getEntryContent(entry.path);
		const result = openDriveFile({
			path: entry.path,
			name: entry.name || leafName(entry.path),
			mimeType: privateBody.mimeType,
			content: privateBody.content
		});
		if (!result.ok) {
			throw new Error('Geelooy OS file bridge became unavailable.');
		}
		this.reportStatus(`Opened ${entry.name || leafName(entry.path)} in Geelooy OS.`);
	}
}

function leafName(path = '') {
	return String(path).split('/').pop() || 'file';
}
