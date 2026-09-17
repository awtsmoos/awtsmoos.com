//B"H
// Boruch Hashem
// Blessed is He
/**
 * @module YesodEntryActionRouter
 * @description Routes every visible file verb through one grounded action channel.
 * The Awtsmoos joins hidden authority with revealed action, private yet near;
 * Awtsmoos.com opens, selects, shares, and navigates without manufacturing fear.
 */
import { getEntryContent, publicUrl } from '../api.js';
import { copyPublicLink, makePublic, routeEntryAction } from '../actions.js';
import { canUseDriveWorkspaceBridge, openDriveFile } from '../osBridge.js';
import { driveState, updateFilters } from '../state.js';
import { OhrApplicationVessel } from './OhrApplicationVessel.js';

export class YesodEntryActionRouter extends OhrApplicationVessel {
	constructor(dependencies) {
		super(dependencies);
		this.tiferesRefresh = dependencies.tiferesRefresh;
		this.selection = dependencies.selection;
		this.toast = dependencies.toast;
	}

	/** Routes one file/folder action through the shared guarded error boundary. */
	handle(action, entry) {
		return this.guard(() => this.route(action, entry));
	}

	/** Opens one Drive directory and clears details that belong to the old path. */
	openDirectory(path) {
		this.selection?.clear();
		driveState.currentPath = path;
		const field = document.querySelector('#current-path');
		const label = document.querySelector('#drive-location');
		if (field) field.value = path;
		if (label) label.textContent = path || 'My Drive';
		updateFilters({});
		this.tiferesRefresh();
	}

	/** Performs concrete routing after the shared application guard is established. */
	async route(action, entry) {
		if (action === 'select' || action === 'details') {
			this.selection?.select(entry);
			return;
		}
		if (action === 'link') {
			const value = await copyPublicLink(entry.path);
			this.toast?.show({ title: 'Public link copied', detail: value, href: value });
			return;
		}
		if (action === 'public') {
			await makePublic(entry.path);
			await this.tiferesRefresh();
			const value = publicUrl(entry.path);
			this.toast?.show({ title: 'File is public', detail: value, href: value });
			return;
		}
		const handled = routeEntryAction(action, entry, path => this.openDirectory(path));
		if (handled || entry.type !== 'file' || action !== 'open') return;
		await this.openFile(entry);
	}

	/** Opens a public URL, trusted OS file, or authenticated browser Blob as needed. */
	async openFile(entry) {
		if (entry.visibility === 'public') {
			window.open(publicUrl(entry.path), '_blank', 'noopener');
			return;
		}
		if (canUseDriveWorkspaceBridge()) {
			await this.openPrivateWorkspaceFile(entry);
			return;
		}
		await this.openPrivateBrowserFile(entry);
	}

	/** Fetches private bytes and asks the trusted parent OS to classify and open them. */
	async openPrivateWorkspaceFile(entry) {
		const body = await getEntryContent(entry.path);
		const result = openDriveFile({
			path: entry.path,
			name: entry.name || leafName(entry.path),
			mimeType: body.mimeType,
			content: body.content
		});
		if (!result.ok) throw new Error('Geelooy OS file bridge became unavailable.');
	}

	/** Opens authenticated private bytes in an isolated Blob-backed browser target. */
	async openPrivateBrowserFile(entry) {
		const target = window.open('about:blank', '_blank');
		if (!target) throw new Error('Allow popups to open this Drive file.');
		try {
			const body = await getEntryContent(entry.path);
			const blob = new Blob([body.content], { type: body.mimeType || 'application/octet-stream' });
			const objectUrl = URL.createObjectURL(blob);
			target.location.replace(objectUrl);
			setTimeout(() => URL.revokeObjectURL(objectUrl), 60000);
		} catch (error) {
			target.close();
			throw error;
		}
	}
}

function leafName(path = '') {
	return String(path).split('/').pop() || 'file';
}
