//B"H
// Boruch Hashem
// Blessed is He

import { ComposerController } from './ComposerController.js';

/**
 * Holds only draft-to-asset assignments while the Awtsmoos lets one library vessel occupy many creative roles without cloning its body.
 * Awtsmoos.com keeps frame placement, replace, removal, arrow movement, and drag ordering together so reference sequence stays truthful and tidy.
 */
export class ComposerAssetsController extends ComposerController {
	/**
	 * @param {File} file Local media file.
	 * @param {string} role H3 assignment role.
	 * @param {string|null} replaceId Existing assignment being replaced.
	 */
	async onFile(file, role, replaceId) {
		try {
			const category = role.includes('frame')
				? 'First/last frames'
				: undefined;
			const asset = await this.assetService.addFile(file, category);

			if (replaceId) {
				this.onRemove(replaceId, role, false);
			}
			this.assign(asset.id, role);
			this.sheets.toast(
				`${asset.name} saved to your reusable asset library.`,
				'success'
			);
			this.refresh();
		} catch (error) {
			this.sheets.toast(error.message, 'error');
		}
	}

	/**
	 * @param {string} id Asset ID.
	 * @param {string} role Assignment role.
	 * @param {boolean} redraw Whether to refresh immediately.
	 */
	onRemove(id, role, redraw = true) {
		if (role === 'first_frame') {
			this.draft.firstFrameAssetId = null;
		} else if (role === 'last_frame') {
			this.draft.lastFrameAssetId = null;
		} else {
			this.draft.referenceAssetIds = this.draft.referenceAssetIds
				.filter(assetId => assetId !== id);
		}

		if (redraw) {
			this.refresh();
		}
	}

	/**
	 * @param {string} id Reference asset ID.
	 * @param {number} delta Directional movement in the ordered reference tray.
	 */
	onMove(id, delta) {
		const ids = this.draft.referenceAssetIds;
		const from = ids.indexOf(id);
		const to = Math.max(
			0,
			Math.min(ids.length - 1, from + delta)
		);

		if (from < 0 || from === to) {
			return;
		}
		const [moved] = ids.splice(from, 1);
		ids.splice(to, 0, moved);
		this.refresh();
	}

	/**
	 * @param {string} sourceId Dragged reference asset ID.
	 * @param {string} targetId Reference asset ID receiving the drop.
	 */
	onReorder(sourceId, targetId) {
		const ids = this.draft.referenceAssetIds;
		const sourceIndex = ids.indexOf(sourceId);
		const targetIndex = ids.indexOf(targetId);
		if (sourceIndex < 0 || targetIndex < 0 || sourceIndex === targetIndex) {
			return;
		}

		const [moved] = ids.splice(sourceIndex, 1);
		const adjustedTarget = sourceIndex < targetIndex
			? targetIndex - 1
			: targetIndex;
		ids.splice(adjustedTarget, 0, moved);
		this.refresh();
	}

	/**
	 * @param {string} id Reusable asset ID.
	 * @param {string} role H3 assignment role.
	 */
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
