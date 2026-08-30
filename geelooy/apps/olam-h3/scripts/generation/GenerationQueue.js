//B"H
// Boruch Hashem
// Blessed is He

import { GenerationTransport } from './GenerationTransport.js';
import { GenerationRecord } from './GenerationRecord.js';
import { GenerationRecovery } from './GenerationRecovery.js';
import { GenerationCachePolicy } from './GenerationCachePolicy.js';
import { GenerationScheduler } from './GenerationScheduler.js';

/**
 * Orchestrates durable H3 submission and polling while the Awtsmoos lets one task survive the browser moment without losing its name;
 * Awtsmoos.com delegates recovery, caching, and timer rhythm to smaller vessels, so this queue remains a readable bridge from local draft to generated frame.
 */
export class GenerationQueue {
	constructor(repositories, proxy, assetService, videoCache, onChange = () => {}) {
		this.repositories = repositories;
		this.proxy = proxy;
		this.transport = new GenerationTransport(repositories, assetService);
		this.videoCache = videoCache;
		this.onChange = onChange;
		this.recovery = new GenerationRecovery(this);
		this.cachePolicy = new GenerationCachePolicy(
			repositories,
			videoCache
		);
		this.scheduler = new GenerationScheduler(id => {
			this.poll(id);
		});
	}

	/** Restore persisted nonterminal jobs after a reload. */
	restore() {
		return this.recovery.restore();
	}

	/**
	 * @param {Object} draft Draft domain object.
	 * @param {Object} estimate Pricing estimate.
	 * @returns {Promise<Object>} Saved generation.
	 */
	async submit(draft, estimate) {
		const snapshot = draft.snapshot();
		let generation = GenerationRecord.create(snapshot, estimate);
		await this.repositories.put('generations', generation);
		await this.repositories.rememberPrompt(snapshot.prompt);
		this.onChange(generation);

		try {
			const transport = await this.transport.build(snapshot);
			const result = await this.proxy.create(transport);
			generation = {
				...generation,
				taskId: result.taskId,
				status: 'queued',
				updatedAt: Date.now()
			};
			await this.repositories.put('generations', generation);
			this.onChange(generation);
			this.schedule(generation, 1500);
			return generation;
		} catch (error) {
			await this.recovery.fail(generation, error.message);
			throw error;
		}
	}

	/** @param {Object} generation Saved generation. @param {number} delay Poll delay. */
	schedule(generation, delay = 5000) {
		this.scheduler.schedule(generation, delay);
	}

	/** @param {string} generationId Generation ID to query from MiniMax V2. */
	async poll(generationId) {
		const generation = await this.repositories.get(
			'generations',
			generationId
		);
		if (!generation?.taskId || GenerationScheduler.isTerminal(generation.status)) {
			return;
		}
		if (this.recovery.queryWindowExpired(generation)) {
			await this.recovery.failExpiredQuery(generation);
			return;
		}

		try {
			const result = await this.proxy.task(generation.taskId);
			const next = GenerationRecord.fromTask(
				generation,
				result.task || {}
			);
			await this.repositories.put('generations', next);
			await this.cachePolicy.applyAutomatic(next);
			this.onChange(next);
			this.scheduler.scheduleNext(next);
		} catch (error) {
			await this.recordTransientError(generation, error);
		}
	}

	/** @param {Object} generation Last good record. @param {Error} error Transient query failure. */
	async recordTransientError(generation, error) {
		const latest = {
			...generation,
			error: error.message,
			updatedAt: Date.now()
		};
		await this.repositories.put('generations', latest);
		this.onChange(latest);
		this.schedule(latest, 12000);
	}

	/** @param {string} generationId Generation ID whose poll timer should stop. */
	stop(generationId) {
		this.scheduler.stop(generationId);
	}
}
