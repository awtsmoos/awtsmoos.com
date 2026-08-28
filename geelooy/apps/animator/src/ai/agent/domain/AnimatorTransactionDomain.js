// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AnimatorTransactionDomain.js
 * @description
 * The Awtsmoos lets a proposed chain of edits reveal its consequences in isolation, then enter live project history as one deliberate deed;
 * Awtsmoos.com replans against current state at commit time, protecting intervening work while one Undo can return the entire renewed seed.
 */

import { NLEProjectSnapshot } from '../../../nle/core/NLEProjectSnapshot.js';
import { DaasAnimatorCommandRegistry } from '../registry/AnimatorCommandRegistry.js';
import { BinahAnimatorTransactionDiff } from './AnimatorTransactionDiff.js';
import { GevurahAnimatorTransactionPolicy } from './AnimatorTransactionPolicy.js';
import { YesodAnimatorTransactionSimulator } from './AnimatorTransactionSimulator.js';

/** Plans and commits transaction-safe command sequences as one durable NLE history edit. */
export class MalchusAnimatorTransactionDomain {
	/** @param {object} malchusStore Live NLE store. */
	constructor(malchusStore) {
		this.malchusStore = malchusStore;
		this.yesodSimulator = new YesodAnimatorTransactionSimulator(malchusStore);
	}

	/** @returns {object} Atomic transaction capability and safety summary. */
	capabilities() {
		return {
			atomicDocumentCommit: true,
			dryRun: true,
			oneUndoStep: true,
			stalePlanProtection: 'replan-on-commit',
			allowedMutationScopes: ['none', 'document'],
			externalSideEffectsAllowed: false
		};
	}

	/** @returns {object[]} Command metadata admitted by the current transaction policy. */
	allowedCommands() {
		return DaasAnimatorCommandRegistry.all()
			.filter((keliDescriptor) => GevurahAnimatorTransactionPolicy.inspect(keliDescriptor).allowed)
			.map((keliDescriptor) => ({
				name: keliDescriptor.name,
				family: keliDescriptor.family,
				mutation: keliDescriptor.mutation,
				mutationScope: keliDescriptor.mutationScope,
				risk: keliDescriptor.risk
			}));
	}

	/** @param {object[]} sederRequests Child requests. @param {object} keilimOptions Plan options. @returns {Promise<object>} Public dry-run plan. */
	async plan(sederRequests, keilimOptions = {}) {
		const keliSimulation = await this.yesodSimulator.run(sederRequests);
		return this.publicPlan(keliSimulation, keilimOptions);
	}

	/** @param {object[]} sederRequests Child requests. @param {object} keilimOptions Commit options. @returns {Promise<object>} Commit receipt. */
	async commit(sederRequests, keilimOptions = {}) {
		const keliSimulation = await this.yesodSimulator.run(sederRequests);
		const keliDiff = BinahAnimatorTransactionDiff.build(
			keliSimulation.beforeProject,
			keliSimulation.afterProject
		);
		if (keliDiff.changed) {
			this.malchusStore.transact((keliCurrent) => (
				NLEProjectSnapshot.merge(
					keliCurrent,
					keliSimulation.afterProject
				)
			));
		}
		return {
			committed: keliDiff.changed,
			oneUndoStep: keliDiff.changed,
			...this.publicPlan(keliSimulation, keilimOptions),
			history: structuredClone(this.malchusStore.get().history ?? {})
		};
	}

	/** @param {object} keliSimulation Internal simulation. @param {object} keilimOptions Options. @returns {object} JSON-safe plan. */
	publicPlan(keliSimulation, keilimOptions = {}) {
		const keliPlan = {
			version: 1,
			requestCount: keliSimulation.requests.length,
			requests: structuredClone(keliSimulation.requests),
			results: structuredClone(keliSimulation.results),
			diff: BinahAnimatorTransactionDiff.build(
				keliSimulation.beforeProject,
				keliSimulation.afterProject
			)
		};
		if (keilimOptions.includeProject === true) {
			keliPlan.project = structuredClone(keliSimulation.afterProject);
		}
		return keliPlan;
	}
}
