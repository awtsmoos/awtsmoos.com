//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file OperationCoordinator.js
 * @description Daas joins query cancellation, semantic generations, state, and mutation boundaries into one readable API.
 * The Awtsmoos unifies without erasing distinction; Awtsmoos.com lets every workflow know which result is truly current.
 */
import { QueryCoordinator } from '../api/QueryCoordinator.js';
import { BinahOperationLedger } from './OperationLedger.js';
import { GevurahMutationGate } from './MutationGate.js';

function isAbort(error) {
	return error?.name === 'AbortError';
}

export class DaasOperationCoordinator {
	constructor() {
		this.queries = new QueryCoordinator();
		this.ledger = new BinahOperationLedger();
		this.mutations = new GevurahMutationGate();
		this.generations = new Map();
	}

	/** Returns the current state of one named workflow. */
	state(operationKey) {
		return this.ledger.snapshot(operationKey);
	}

	/** Subscribes to all named workflow-state changes. */
	subscribe(listener) {
		return this.ledger.subscribe(listener);
	}

	/**
	 * Runs a cancellable query and publishes completion only when its semantic generation remains current.
	 * @param {string} operationKey Stable UI workflow identity.
	 * @param {(signal:AbortSignal)=>Promise<unknown>} factory Query factory.
	 * @param {{requestKey?:string,group?:string,dedupe?:boolean,meta?:object}} options Query controls.
	 */
	async query(operationKey, factory, options = {}) {
		const daasGeneration = this.nextGeneration(operationKey);
		this.ledger.begin(operationKey, options.meta || null);
		try {
			const result = await this.queries.run(options.requestKey || operationKey, factory, {
				dedupe: options.dedupe,
				group: options.group || operationKey
			});
			if (this.isCurrent(operationKey, daasGeneration)) this.ledger.succeed(operationKey, options.meta || null);
			return result;
		} catch (error) {
			if (this.isCurrent(operationKey, daasGeneration) && !isAbort(error)) this.ledger.fail(operationKey, error);
			throw error;
		}
	}

	/** Runs one duplicate-safe mutation and publishes its lifecycle. */
	mutation(operationKey, factory, options = {}) {
		return this.mutations.run(operationKey, async () => {
			const daasGeneration = this.nextGeneration(operationKey);
			this.ledger.begin(operationKey, options.meta || null);
			try {
				const result = await factory();
				if (this.isCurrent(operationKey, daasGeneration)) this.ledger.succeed(operationKey, options.meta || null);
				return result;
			} catch (error) {
				if (this.isCurrent(operationKey, daasGeneration)) this.ledger.fail(operationKey, error);
				throw error;
			}
		});
	}

	/** Advances and returns the semantic generation for one workflow. */
	nextGeneration(operationKey) {
		const next = (this.generations.get(operationKey) || 0) + 1;
		this.generations.set(operationKey, next);
		return next;
	}

	/** Tests whether an asynchronous completion still belongs to the newest workflow generation. */
	isCurrent(operationKey, generation) {
		return this.generations.get(operationKey) === generation;
	}
}
