//B"H
// Boruch Hashem
// Blessed is He
/**
 * @module YesodBulkActionRouter
 * @description Grounds multi-selection in canonical filesystem verbs with honest batch testimony.
 * The Awtsmoos joins many paths beneath one intent while every finite success and failure remains known;
 * Awtsmoos.com refreshes once, keeps failed paths selected, and never calls a partial act wholly done.
 */
import { publicUrl } from '../api.js';
import {
	makePublicEntries,
	purgeEntries,
	restoreEntries,
	transferEntries,
	trashEntries,
	validateTransferDestination
} from '../bulkActions.js';
import { driveState } from '../state.js';
import { OhrApplicationVessel } from './OhrApplicationVessel.js';

export class YesodBulkActionRouter extends OhrApplicationVessel {
	constructor(dependencies) {
		super(dependencies);
		this.selection = dependencies.selection;
		this.dialog = dependencies.bulkDialog;
		this.bulkBar = dependencies.bulkBar;
		this.toast = dependencies.toast;
		this.tiferesRefresh = dependencies.tiferesRefresh;
	}

	handle(action) {
		return this.guard(() => this.route(action));
	}

	async route(action) {
		if (action === 'clear') return this.selection.clear();
		if (action === 'toggle-all') return this.selection.toggleAll(driveState.entries);
		const entries = this.selection.entries();
		if (!entries.length) return;
		if (action === 'links') return this.copyLinks(entries);
		if (action === 'trash' && !await this.dialog.confirmTrash(entries.length)) return;
		if (action === 'purge' && !await this.dialog.confirmPurge(entries.length)) return;
		if (action === 'move' || action === 'copy') return this.transfer(action, entries);
		const operations = {
			trash: progress => trashEntries(entries, progress),
			restore: progress => restoreEntries(entries, progress),
			purge: progress => purgeEntries(entries, progress),
			public: progress => makePublicEntries(entries, progress)
		};
		if (!operations[action]) return;
		await this.execute(action, entries, operations[action]);
	}

	async transfer(action, entries) {
		const destination = await this.dialog.openTransfer(
			action,
			driveState.currentPath,
			path => validateTransferDestination(entries, path)
		);
		if (destination === null) return;
		await this.execute(
			action,
			entries,
			progress => transferEntries(action, entries, destination, progress)
		);
	}

	async execute(action, entries, operation) {
		const label = actionLabel(action);
		this.bulkBar?.setBusy(true, `${label} 0 of ${entries.length}…`);
		try {
			const result = await operation(progress => {
				this.bulkBar?.setBusy(true, `${label} ${progress.index} of ${progress.total}…`);
			});
			await this.tiferesRefresh();
			const failedPaths = result.failed.map(item => item.entry.path);
			if (failedPaths.length) this.selection.keep(failedPaths);
			else this.selection.clear();
			this.reportResult(label, result);
		} finally {
			this.bulkBar?.setBusy(false, '');
		}
	}

	async copyLinks(entries) {
		const links = entries.map(entry => publicUrl(entry.path));
		await navigator.clipboard.writeText(links.join('\n'));
		this.toast?.show({
			title: `${links.length} public ${links.length === 1 ? 'link' : 'links'} copied`,
			detail: links.length === 1 ? links[0] : 'Ready to paste.'
		});
	}

	reportResult(label, result) {
		const succeeded = result.succeeded.length;
		const failed = result.failed.length;
		const title = failed ? `${succeeded} succeeded · ${failed} failed` : `${succeeded} ${pastTense(label)}`;
		const detail = failed ? result.failed[0].message : 'Drive is up to date.';
		this.toast?.show({ title, detail });
	}
}

function actionLabel(action) {
	return ({ move: 'Moving', copy: 'Copying', trash: 'Trashing', restore: 'Restoring', purge: 'Deleting', public: 'Publishing' })[action] || 'Working';
}

function pastTense(label) {
	return ({ Moving: 'moved', Copying: 'copied', Trashing: 'trashed', Restoring: 'restored', Deleting: 'deleted', Publishing: 'made public' })[label] || 'updated';
}
