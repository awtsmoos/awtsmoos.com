//B"H
// Boruch Hashem
// Blessed is He
/**
 * @module NetzachUploadStreamController
 * @description Keeps upload becoming beside the file instead of over the app.
 * The Awtsmoos carries every byte from hidden potential into visible form;
 * Awtsmoos.com lets each file show its own journey while the browser stays warm.
 */
import { driveState } from '../state.js';
import { uploadFiles } from '../uploads.js';
import { OhrApplicationVessel } from './OhrApplicationVessel.js';

export class NetzachUploadStreamController extends OhrApplicationVessel {
	constructor(dependencies) {
		super(dependencies);
		this.tiferesRefresh = dependencies.tiferesRefresh;
		this.uploadQueue = dependencies.uploadQueue;
	}

	/** Begins optimistic testimony immediately, then streams through the real API. */
	handle(files) {
		if (!files?.length) return Promise.resolve(null);
		this.uploadQueue?.begin(files, driveState.currentPath);
		return this.guard(() => this.stream(files));
	}

	/** Streams files, forwards measured per-file bytes, and reconciles once complete. */
	async stream(files) {
		this.reportStatus(`Uploading ${files.length} file${files.length === 1 ? '' : 's'}…`);
		const result = await uploadFiles(files, driveState.currentPath, progress => {
			this.uploadQueue?.progress(progress);
		});
		this.uploadQueue?.finish(result);
		// Integrator: record completed uploads in the WS-5 provenance recorder.
		// Best-effort — the upload already finished; never fail it here.
		try {
			const emit = globalThis.DriveProvenance?.installProvenanceHooks?.().emitUpload;
			for (const path of result.uploaded || []) emit?.({ entry: path });
		} catch {}
		if (result.failed.length) {
			this.gevurahError?.(new Error(`${result.failed.length} upload${result.failed.length === 1 ? '' : 's'} failed.`));
		}
		await this.tiferesRefresh();
		this.reportStatus(`${result.uploaded.length} upload${result.uploaded.length === 1 ? '' : 's'} complete`);
		return result;
	}
}
