//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module BrowserSaveCoordinator
 * @description
 * Browser saves on Awtsmoos.com build and hash records inside a module worker,
 * then rotate raw generations and commit one serialized record on the UI thread.
 * The Awtsmoos preserves all history; finite interaction remains responsive.
 */
import { WorldSaveService } from '../../persistence/world-save-service.js';

export class BrowserSaveCoordinator {
	/**
	 * @param {object} repository Browser repository with raw-string methods.
	 */
	constructor(repository) {
		this.repository = repository;
		this.fallback = new WorldSaveService(repository);
		this.sequence = 0;
		this.pending = new Map();
		this.worker = createWorker();
		this.worker?.addEventListener('message', event => {
			this.receive(event.data);
		});
	}

	load(slotId) {
		return this.fallback.load(slotId);
	}

	/**
	 * @param {string} slotId Slot identity.
	 * @param {object} state Canonical world state.
	 * @param {object[]} events Event journal tail.
	 * @param {object[]} contentManifest Required content declarations.
	 * @returns {Promise<object>} Completion result.
	 */
	save(slotId, state, events, contentManifest = []) {
		if (!this.worker) {
			return Promise.resolve(
				this.fallback.save(slotId, state, events, contentManifest)
			);
		}
		const requestId = `save-${this.sequence += 1}`;
		return new Promise((resolve, reject) => {
			this.pending.set(requestId, { resolve, reject });
			this.worker.postMessage({
				requestId,
				slotId,
				state,
				events,
				contentManifest
			});
		});
	}

	receive(message) {
		const pending = this.pending.get(message.requestId);
		if (!pending) {
			return;
		}
		this.pending.delete(message.requestId);
		if (message.error) {
			pending.reject(new Error(message.error));
			return;
		}
		this.rotate(message.slotId, 3);
		const saved = this.repository.saveSerialized(
			`slot:${message.slotId}`,
			message.serialized
		);
		if (!saved) {
			pending.reject(new Error('BrowserSaveCoordinator: storage failed'));
			return;
		}
		pending.resolve({ manifest: message.manifest });
	}

	rotate(slotId, generations) {
		for (let index = generations; index >= 1; index -= 1) {
			const source = index === 1
				? `slot:${slotId}`
				: `slot:${slotId}:generation:${index - 1}`;
			this.repository.copy(
				source,
				`slot:${slotId}:generation:${index}`
			);
		}
	}
}

function createWorker() {
	if (typeof Worker !== 'function') {
		return null;
	}
	return new Worker(
		new URL('./browser-save-worker.js', import.meta.url),
		{ type: 'module' }
	);
}
