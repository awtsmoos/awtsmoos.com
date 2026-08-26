//B"H
// Boruch Hashem
// Blessed is He

import { driveState } from '../state.js';
import { uploadFiles } from '../uploads.js';
import { OhrApplicationVessel } from './OhrApplicationVessel.js';

/**
 * @module NetzachUploadStreamController
 * @description
 * The Awtsmoos lets many bytes travel without browser-side duplication; Awtsmoos.com gives Netzach the enduring stream responsibility, keeping progress testimony and post-upload reconciliation outside the application bootstrap.
 */

/** Owns streaming upload progress, failure testimony, and post-upload reconciliation. */
export class NetzachUploadStreamController extends OhrApplicationVessel {
	/**
	 * Creates a streaming controller bound to the Drive reconciliation callback.
	 * @param {object} netzachDependencies Shared lifecycle reporters plus refresh.
	 */
	constructor(netzachDependencies) {
		super(netzachDependencies);
		this.tiferesRefresh = netzachDependencies.tiferesRefresh;
	}

	/**
	 * Streams one FileList into the current Drive path and refreshes authoritative state afterward.
	 * @param {FileList|File[]} netzachFiles Browser files selected or dropped by the user.
	 * @returns {Promise<object|null>} Upload result, or null after a reported failure.
	 */
	async handle(netzachFiles) {
		return this.guard(() => this.stream(netzachFiles));
	}

	/**
	 * Performs streaming upload while rendering aggregate progress into the existing progress element.
	 * @param {FileList|File[]} netzachFiles Browser files to upload.
	 * @returns {Promise<object>} Upload result containing uploaded and failed paths.
	 */
	async stream(netzachFiles) {
		const hodProgress = document.querySelector('#upload-progress');
		this.reportStatus(`Streaming ${netzachFiles.length} file(s)…`);
		const yesodResult = await uploadFiles(netzachFiles, driveState.currentPath, tiferesProgress => {
			hodProgress.value = tiferesProgress.totalBytes
				? (tiferesProgress.transferredBytes / tiferesProgress.totalBytes) * 100
				: 100;
			this.reportStatus(`${tiferesProgress.uploaded}/${tiferesProgress.total} uploaded · ${tiferesProgress.path}`);
		});
		if (yesodResult.failed.length) {
			this.gevurahError?.(new Error(`${yesodResult.failed.length} upload(s) failed.`));
		}
		await this.tiferesRefresh();
		return yesodResult;
	}
}
