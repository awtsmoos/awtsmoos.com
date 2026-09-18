//B"H
// Boruch Hashem
// Blessed is He
/**
 * @module YesodEntryActionRouter
 * @description Routes visible single-entry verbs through one grounded Drive action channel.
 * The Awtsmoos joins hidden authority with revealed action, private yet near;
 * Awtsmoos.com opens, chooses, shares, and organizes without multiplying file-state fear.
 */
import { getEntryContent, publicUrl } from '../api.js';
import { applyPathAction, copyPublicLink, makePublic, routeEntryAction } from '../actions.js';
import { validateTransferDestination } from '../bulkActions.js';
import { canUseDriveWorkspaceBridge, openDriveFile } from '../osBridge.js';
import { basename, joinDrivePath } from '../path.js';
import { driveState, updateFilters } from '../state.js';
import { OhrApplicationVessel } from './OhrApplicationVessel.js';

export class YesodEntryActionRouter extends OhrApplicationVessel {
	constructor(dependencies) {
		super(dependencies);
		this.tiferesRefresh = dependencies.tiferesRefresh;
		this.selection = dependencies.selection;
		this.toast = dependencies.toast;
		this.bulkDialog = dependencies.bulkDialog;
	}
	/** Gives every visible entry action one guarded public doorway. */
	handle(action, entry) {
		return this.guard(() => this.route(action, entry));
	}
	/** Opens one directory and clears selection that belonged to the old path. */
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
	async route(action, entry) {
		if (action === 'toggle-select') return this.selection?.toggle(entry);
		if (action === 'select' || action === 'details') return this.selection?.select(entry);
		if (action === 'move' || action === 'copy') return this.transfer(action, entry);
		if (action === 'link') return this.copyLink(entry);
		if (action === 'public') return this.makeEntryPublic(entry);
		const handled = routeEntryAction(action, entry, path => this.openDirectory(path));
		if (handled || entry.type !== 'file' || action !== 'open') return;
		await this.openFile(entry);
	}
	async transfer(action, entry) {
		const destination = await this.bulkDialog.openTransfer(
			action,
			driveState.currentPath,
			path => validateTransferDestination([entry], path)
		);
		if (destination === null) return;
		const target = joinDrivePath(destination, basename(entry.path));
		await applyPathAction(action, entry.path, target);
		await this.tiferesRefresh();
		this.selection?.clear();
		this.toast?.show({
			title: action === 'copy' ? 'Copy created' : 'Item moved',
			detail: destination || 'My Drive'
		});
	}
	async copyLink(entry) {
		const value = await copyPublicLink(entry.path);
		this.toast?.show({ title: 'Public link copied', detail: value, href: value });
	}
	async makeEntryPublic(entry) {
		await makePublic(entry.path);
		await this.tiferesRefresh();
		const value = publicUrl(entry.path);
		this.toast?.show({ title: 'File is public', detail: value, href: value });
	}
	async openFile(entry) {
		if (entry.visibility === 'public') {
			window.open(publicUrl(entry.path), '_blank', 'noopener');
			return;
		}
		if (canUseDriveWorkspaceBridge()) return this.openPrivateWorkspaceFile(entry);
		return this.openPrivateBrowserFile(entry);
	}
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
