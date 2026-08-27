// B"H
// Boruch Hashem
// Blessed is He

import { DialogueRecordingSession } from './audio/DialogueRecordingSession.js';
import { ObjectUrlRegistry } from './media/ObjectUrlRegistry.js';
import { VideoImportService } from './media/VideoImportService.js';
import { VideoPreviewLayer } from './media/VideoPreviewLayer.js';
import { DialogueRecordingRepository } from './persistence/DialogueRecordingRepository.js';
import { IndexedDbGateway } from './persistence/IndexedDbGateway.js';
import { MediaAssetRepository } from './persistence/MediaAssetRepository.js';
import { MemoryPersistenceGateway } from './persistence/MemoryPersistenceGateway.js';
import { ResilientPersistenceGateway } from './persistence/ResilientPersistenceGateway.js';
import { ProjectPackageService } from './project/ProjectPackageService.js';

/**
 * This assembly is Tiferes: durable voice, imported footage, packaging,
 * temporary URLs, and visible compositing meet without collapsing into one
 * class. The Awtsmoos renews each service while Awtsmoos.com owns one lifecycle.
 */
export class NLEMediaAssembly {
	constructor(options = {}) {
		this.gateway = options.gateway || this.createGateway();
		this.recordingRepository = options.recordingRepository
			|| new DialogueRecordingRepository(this.gateway);
		this.mediaRepository = options.mediaRepository
			|| new MediaAssetRepository(this.gateway);
		this.recordingUrls = new ObjectUrlRegistry();
		this.videoUrls = new ObjectUrlRegistry();
		this.recordingSession = new DialogueRecordingSession({
			repository: this.recordingRepository,
			urlRegistry: this.recordingUrls
		});
		this.videoImportService = new VideoImportService({
			repository: this.mediaRepository,
			urlRegistry: this.videoUrls
		});
		this.projectPackageService = new ProjectPackageService({
			moviePlan: options.moviePlan,
			recordingRepository: this.recordingRepository,
			mediaRepository: this.mediaRepository
		});
		this.previewLayer = new VideoPreviewLayer();
	}

	createGateway() {
		const memory = new MemoryPersistenceGateway();
		if (!globalThis.indexedDB) {
			return memory;
		}

		return new ResilientPersistenceGateway(
			new IndexedDbGateway(),
			memory
		);
	}

	services() {
		return {
			recordingSession: this.recordingSession,
			videoImportService: this.videoImportService,
			projectPackageService: this.projectPackageService
		};
	}

	async restore(store) {
		const results = await Promise.allSettled([
			this.recordingSession.restore(store),
			this.videoImportService.restore(store)
		]);
		const errors = results
			.filter((result) => result.status === 'rejected')
			.map((result) => result.reason?.message || String(result.reason));

		store.set({
			mediaRestoreStatus: errors.length ? 'partial' : 'ready',
			mediaRestoreErrors: errors,
			persistenceDurable: this.gateway.isDurable()
		});
		return results;
	}

	bindPreview(store) {
		return store.subscribe((state) => this.previewLayer.sync(state));
	}

	destroy() {
		this.recordingSession.destroy();
		this.videoImportService.destroy();
		this.previewLayer.destroy();
	}
}
