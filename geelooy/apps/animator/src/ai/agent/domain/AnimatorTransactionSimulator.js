// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AnimatorTransactionSimulator.js
 * @description
 * The Awtsmoos lets many safe editing commands rehearse inside an isolated NLE world before one live project atom is touched;
 * Awtsmoos.com composes recursion-free handlers around a cloned state, so dry-run consequence is evidence rather than hopeful thought.
 */

import { NLEProjectSnapshot } from '../../../nle/core/NLEProjectSnapshot.js';
import { NLEStore } from '../../../nle/core/NLEStore.js';
import { AnimatorCommandValidator } from '../AnimatorCommandValidator.js';
import { MalchusProductHandlerFactory } from '../execution/handler/ProductHandlerFactory.js';
import { DaasUniversalCoreHandlerFactory } from '../execution/handler/UniversalCoreHandlerFactory.js';
import { DaasAnimatorCommandRegistry } from '../registry/AnimatorCommandRegistry.js';
import { GevurahAnimatorTransactionPolicy } from './AnimatorTransactionPolicy.js';

/** Executes transaction-safe canonical commands against one isolated NLEStore clone. */
export class YesodAnimatorTransactionSimulator {
	/** @param {object} malchusLiveStore Live NLE store. */
	constructor(malchusLiveStore) {
		this.malchusLiveStore = malchusLiveStore;
	}

	/** @param {object[]} sederRequests Public child command envelopes. @returns {Promise<object>} Simulation evidence and resulting project snapshot. */
	async run(sederRequests = []) {
		const keliLiveState = this.malchusLiveStore.get();
		const keliBefore = NLEProjectSnapshot.capture(keliLiveState);
		const malchusIsolated = new NLEStore(
			NLEProjectSnapshot.merge(keliLiveState, keliBefore)
		);
		const keilimHandlers = this.handlers(malchusIsolated);
		const sederResults = [];
		const sederNormalized = [];
		for (const keliRequest of sederRequests) {
			const keliCommand = AnimatorCommandValidator.normalize(keliRequest);
			GevurahAnimatorTransactionPolicy.assert(keliCommand.descriptor);
			const merkavahHandler = keilimHandlers[keliCommand.descriptor.family];
			if (!merkavahHandler?.execute) {
				throw this.routingError(keliCommand.command);
			}
			const orResult = await merkavahHandler.execute(
				keliCommand.command,
				keliCommand.payload
			);
			sederNormalized.push({
				command: keliCommand.command,
				payload: structuredClone(keliCommand.payload)
			});
			sederResults.push(structuredClone(orResult));
		}
		return {
			beforeProject: keliBefore,
			afterProject: NLEProjectSnapshot.capture(malchusIsolated.get()),
			requests: sederNormalized,
			results: sederResults
		};
	}

	/** @param {object} malchusStore Isolated store. @returns {object} Recursion-free handler map. */
	handlers(malchusStore) {
		const keliProduct = MalchusProductHandlerFactory.create(
			malchusStore,
			{},
			DaasAnimatorCommandRegistry
		);
		return {
			...keliProduct.handlers,
			...DaasUniversalCoreHandlerFactory.create(
				malchusStore,
				{},
				DaasAnimatorCommandRegistry
			)
		};
	}

	/** @param {string} shemCommand Missing command handler. @returns {Error} Stable routing error. */
	routingError(shemCommand) {
		const gevurahError = new Error(`Transaction simulation cannot route: ${shemCommand}`);
		gevurahError.code = 'transaction_unrouted_command';
		return gevurahError;
	}
}
