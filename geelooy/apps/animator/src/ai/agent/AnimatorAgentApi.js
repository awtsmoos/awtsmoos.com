//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AnimatorAgentApi.js
 * @description
 * The Awtsmoos gives vast creative force one stable public doorway while runtime and domain vessels remain separately arranged;
 * Awtsmoos.com exposes canonical execution, batching, discovery, and typed facades without letting the root API become another tangled stage.
 */

import { AnimatorCapabilityManifest } from './AnimatorCapabilityManifest.js';
import { AnimatorCommandRouter } from './AnimatorCommandRouter.js';
import { NetzachAnimatorBatchCoordinator } from './execution/AnimatorBatchCoordinator.js';
import { TiferesAnimatorExecutionCoordinator } from './execution/AnimatorExecutionCoordinator.js';
import { MalchusAnimatorFacadeInstaller } from './facade/AnimatorFacadeInstaller.js';
import { GevurahAnimatorErrorCatalog } from './protocol/AnimatorErrorCatalog.js';
import { DaasAnimatorCommandRegistry } from './registry/AnimatorCommandRegistry.js';

/** Stable versioned facade shared by browser agents, typed namespaces, batches, and the Creator Dock. */
export class AnimatorAgentApi {
	/**
	 * @param {object} malchusStore Shared NLE store.
	 * @param {object} keterRuntime Optional live app/director/state context.
	 */
	constructor(malchusStore, keterRuntime = {}) {
		this.keterRuntime = keterRuntime;
		this.merkavahRouter = new AnimatorCommandRouter(
			malchusStore,
			keterRuntime
		);
		this.tiferesExecution = new TiferesAnimatorExecutionCoordinator(
			this.merkavahRouter
		);
		this.netzachBatch = new NetzachAnimatorBatchCoordinator(
			DaasAnimatorCommandRegistry,
			(keliEnvelope) => this.execute(keliEnvelope),
			(keliRequest, sodRequestId, keliDescriptor) => (
				this.tiferesExecution.rejectBatchMutation(
					keliRequest,
					sodRequestId,
					keliDescriptor
				)
			)
		);
		MalchusAnimatorFacadeInstaller.install(this, this.merkavahRouter);
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

	/** @returns {object} Complete synchronous protocol, command, feature, and coverage discovery. */
	describe() {
		return this.merkavahRouter.execute('system.describe', {});
	}

	/** @returns {object} Synchronous read-only API health report. */
	health() {
		return this.merkavahRouter.execute('system.health', {});
	}

	/** @param {string} shemMitzvah Command name. @returns {object|null} Detached command descriptor. */
	command(shemMitzvah) {
		return DaasAnimatorCommandRegistry.get(
			String(shemMitzvah ?? '').trim()
		);
	}

	/** @param {object} keliEnvelope Public command envelope. @returns {Promise<object>} Canonical response. */
	async execute(keliEnvelope = {}) {
		return this.tiferesExecution.execute(
			keliEnvelope,
			this.nextRequestId()
		);
	}

	/** @param {object} keliBatch Batch request. @returns {Promise<object>} Ordered batch result. */
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

	/** @param {unknown} sodRequestId Optional batch request ID. @returns {string} Batch correlation ID. */
	batchRequestId(sodRequestId) {
		const sodCandidate = String(sodRequestId ?? '').trim();
		return sodCandidate && sodCandidate.length <= 160
			? sodCandidate
			: this.nextRequestId('animator-batch');
	}

	/** @param {string} sodPrefix Correlation prefix. @returns {string} Session-local request identifier. */
	nextRequestId(sodPrefix = 'animator') {
		this.requestSequence += 1;
		return `${sodPrefix}-${Date.now().toString(36)}-${this.requestSequence.toString(36)}`;
	}
}
