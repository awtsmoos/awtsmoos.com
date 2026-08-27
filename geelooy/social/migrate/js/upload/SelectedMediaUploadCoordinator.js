//B"H
//Boruch Hashem
//Blessed is He

/**
 * @class SelectedMediaUploadCoordinator
 * @description
 * The Awtsmoos lets native image and audio checkpoints rest while fingerprinted video returns through shared public proof;
 * Awtsmoos.com preserves old successful migrations, yet new video recovery checks current bytes before declaring reuse truth.
 */
export class SelectedMediaUploadCoordinator {
	constructor({ nativeUploader, videoUploader, checkpoint }) {
		Object.assign(this, { nativeUploader, videoUploader, checkpoint });
	}

	allPaths(items) {
		return [...new Set(items.flatMap(item => item.mediaPaths || []))];
	}

	partition(archive, paths) {
		const nativePaths = [];
		const videoPaths = [];
		for (const path of paths) {
			const kind = archive.resolve(path)?.kind;
			if (kind === 'video') videoPaths.push(path);
			else if (kind === 'image' || kind === 'audio') nativePaths.push(path);
		}
		return { nativePaths, videoPaths };
	}

	pending(state, items, archive) {
		const { nativePaths, videoPaths } = this.partition(archive, this.allPaths(items));
		return {
			nativePaths: nativePaths.filter(path => !state.uploadedAssets[path]),
			videoPaths: videoPaths.filter(path => {
				const existing = state.uploadedAssets[path];
				return !existing || Boolean(existing.fileFingerprint);
			})
		};
	}

	async upload({ state, items, archive, capabilities, onProgress = () => {} }) {
		const { nativePaths, videoPaths } = this.pending(state, items, archive);
		const total = nativePaths.length + videoPaths.length;
		if (!total) return {};
		const uploaded = {};
		const nativeResults = await this.nativeUploader.uploadPaths({
			aliasId: state.destination.aliasId,
			paths: nativePaths,
			maxFilesPerRequest: capabilities?.upload?.maxFilesPerRequest || 4,
			resolveMedia: async path => ({ path, file: await archive.mediaFile(path) }),
			onBatch: progress => {
				Object.assign(state.uploadedAssets, progress.results);
				this.checkpoint.save(state);
				onProgress({ current: progress.current, total });
			}
		});
		Object.assign(uploaded, nativeResults);
		const videoBase = nativePaths.length;
		const videoResults = await this.videoUploader.uploadPaths({
			paths: videoPaths,
			archive,
			items,
			existingAssets: state.uploadedAssets,
			onProgress: progress => onProgress({
				...progress,
				current: videoBase + progress.current,
				total
			}),
			onItem: result => {
				state.uploadedAssets[result.path] = result.asset;
				this.checkpoint.save(state);
			}
		});
		Object.assign(uploaded, videoResults);
		Object.assign(state.uploadedAssets, uploaded);
		this.checkpoint.save(state);
		return uploaded;
	}
}
