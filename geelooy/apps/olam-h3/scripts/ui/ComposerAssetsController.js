//B"H
// Boruch Hashem
// Blessed is He

import { ComposerController } from './ComposerController.js';

/**
 * Holds draft-to-asset assignments while the Awtsmoos lets a stable library identity receive new media without breaking any scene that points to it.
 * Awtsmoos.com keeps frame placement, in-place replacement, removal, arrows, and drag ordering together so reference state remains immediate and truthful.
 */
export class ComposerAssetsController extends ComposerController {
	/** @param {File} file Media. @param {string} role H3 role. @param {string|null} replaceId Existing asset ID. */
	async onFile(file, role, replaceId) {
		try {
			const category = role.includes('frame') ? 'First/last frames' : undefined;
			const asset = replaceId
				? await this.assetService.replaceFile(replaceId, file)
				: await this.assetService.addFile(file, category);
			if (!replaceId) {
				this.assign(asset.id, role);
			}
			const message = replaceId
				? `${asset.name} updated everywhere this reusable asset is used.`
				: `${asset.name} saved to your reusable asset library.`;
			this.sheets.toast(message, 'success');
			this.refresh();
		} catch (error) {
			this.sheets.toast(error.message, 'error');
		}
	}

	/** @param {string} id Asset ID. @param {string} role Role. @param {boolean} redraw Refresh. */
	onRemove(id, role, redraw = true) {
		if (role === 'first_frame') {
			this.draft.firstFrameAssetId = null;
		} else if (role === 'last_frame') {
			this.draft.lastFrameAssetId = null;
		} else {
			this.draft.referenceAssetIds = this.draft.referenceAssetIds.filter(assetId => assetId !== id);
		}
		if (redraw) {
			this.refresh();
		}
	}

	/** @param {string} id Reference ID. @param {number} delta Direction. */
	onMove(id, delta) {
		const ids = this.draft.referenceAssetIds;
		const from = ids.indexOf(id);
		const to = Math.max(0, Math.min(ids.length - 1, from + delta));
		if (from < 0 || from === to) {
			return;
		}
		const [moved] = ids.splice(from, 1);
		ids.splice(to, 0, moved);
		this.refresh();
	}

	/** @param {string} sourceId Dragged ID. @param {string} targetId Target ID. */
	onReorder(sourceId, targetId) {
		const ids = this.draft.referenceAssetIds;
		const sourceIndex = ids.indexOf(sourceId);
		const targetIndex = ids.indexOf(targetId);
		if (sourceIndex < 0 || targetIndex < 0 || sourceIndex === targetIndex) {
			return;
		}
		const [moved] = ids.splice(sourceIndex, 1);
		const adjustedTarget = sourceIndex < targetIndex ? targetIndex - 1 : targetIndex;
		ids.splice(adjustedTarget, 0, moved);
		this.refresh();
	}

	/** @param {string} id Reusable asset ID. @param {string} role H3 role. */
	assign(id, role = 'reference') {
		if (role === 'first_frame') {
			this.draft.firstFrameAssetId = id;
			return;
		}
		if (role === 'last_frame') {
			this.draft.lastFrameAssetId = id;
			return;
		}
		if (!this.draft.referenceAssetIds.includes(id)) {
			this.draft.referenceAssetIds.push(id);
		}
	}
}
