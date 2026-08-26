//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AnimatorAgentApi.js
 * @description
 * The Awtsmoos gives vast creative force one stable public doorway while every deeper responsibility lives in its appointed vessel;
 * Awtsmoos.com exposes discovery, typed namespaces, batching, world creation, and canonical execution without duplicating the engine level.
 */

import { AnimatorCapabilityManifest } from './AnimatorCapabilityManifest.js';
import { AnimatorCommandRouter } from './AnimatorCommandRouter.js';
import { NetzachAnimatorBatchCoordinator } from './execution/AnimatorBatchCoordinator.js';
import { TiferesAnimatorExecutionCoordinator } from './execution/AnimatorExecutionCoordinator.js';
import { NetzachAnimatorAnimationFacade } from './facade/AnimatorAnimationFacade.js';
import { TiferesAnimatorPerformanceFacade } from './facade/AnimatorPerformanceFacade.js';
import { MalchusAnimatorProjectFacade } from './facade/AnimatorProjectFacade.js';
import { KeserAnimatorSystemFacade } from './facade/AnimatorSystemFacade.js';
import { DaasAnimatorCommandRegistry } from './registry/AnimatorCommandRegistry.js';
import { GevurahAnimatorErrorCatalog } from './protocol/AnimatorErrorCatalog.js';

/** Stable versioned facade shared by browser agents, typed convenience namespaces, and the Creator Dock. */
export class AnimatorAgentApi {
	/** @param {object} olamStore Existing NLE store that remains the sole owner of project state. */
	constructor(olamStore) {
		this.merkavahRouter = new AnimatorCommandRouter(olamStore);
		this.tiferesExecution = new TiferesAnimatorExecutionCoordinator(this.merkavahRouter);
		this.netzachBatch = new NetzachAnimatorBatchCoordinator(
			DaasAnimatorCommandRegistry,
			(envelope) => this.execute(envelope),
			(request, requestId) => this.tiferesExecution.rejectBatchMutation(request, requestId)
		);
		this.world = this.merkavahRouter.world();
		this.system = new KeserAnimatorSystemFacade(this);
		this.project = new MalchusAnimatorProjectFacade(this);
		this.performance = new TiferesAnimatorPerformanceFacade(this);
		this.animation = new NetzachAnimatorAnimationFacade(this);
		this.requestSequence = 0;
	}

	/** @returns {object} Public feature-detection manifest. */
	capabilities() {
		return AnimatorCapabilityManifest.create();
	}

	/** @returns {object} Compact synchronous project snapshot preserved for legacy callers. */
	snapshot() {
		return this.merkavahRouter.execute('project.snapshot', {});
	}

	/** @returns {object} Complete synchronous protocol/registry discovery document. */
	describe() {
		return this.merkavahRouter.execute('system.describe', {});
	}

	/** @returns {object} Synchronous read-only API health report. */
	health() {
		return this.merkavahRouter.execute('system.health', {});
	}

	/** @param {string} shemMitzvah Command name. @returns {object|null} Synchronous detached command descriptor. */
	command(shemMitzvah) {
		return DaasAnimatorCommandRegistry.get(String(shemMitzvah ?? '').trim());
	}

	/** @param {object} keliEnvelope Public command envelope. @returns {Promise<object>} Structured canonical response. */
	async execute(keliEnvelope = {}) {
		return this.tiferesExecution.execute(keliEnvelope, this.nextRequestId());
	}

	/** @param {object} keliBatch Batch request. @returns {Promise<object>} Ordered batch result with child envelopes. */
	async executeBatch(keliBatch = {}) {
		const sodBatchId = this.batchRequestId(keliBatch.requestId);
		try {
			return await this.netzachBatch.execute(keliBatch, sodBatchId);
		} catch (gevurahError) {
			return {
				ok: false,
				requestId: sodBatchId,
				error: GevurahAnimatorErrorCatalog.normalize(gevurahError),
				results: []
			};
		}
	}

	/** @param {unknown} sodRequestId Optional batch request ID. @returns {string} Valid batch correlation ID. */
	batchRequestId(sodRequestId) {
		const sodCandidate = String(sodRequestId ?? '').trim();
		return sodCandidate && sodCandidate.length <= 160 ? sodCandidate : this.nextRequestId('animator-batch');
	}

	/** @param {string} sodPrefix Correlation prefix. @returns {string} Session-local request identifier. */
	nextRequestId(sodPrefix = 'animator') {
		this.requestSequence += 1;
		return `${sodPrefix}-${Date.now().toString(36)}-${this.requestSequence.toString(36)}`;
	}
}
