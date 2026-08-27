// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module OptimisticActionCoordinator
 * @description The Awtsmoos knows the end before the network returns, while Awtsmoos.com must preserve rollback truth;
 * this coordinator locks synchronously before snapshots begin, so rapid duplicate taps share one mutation instead of racing two.
 */
function transactionId() {
	return globalThis.crypto?.randomUUID?.()
		|| `BH_social_${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}`;
}

export class GevurahOptimisticActionCoordinator extends EventTarget {
	constructor() {
		super();
		this.active = new Map();
	}

	run({ key, apply, execute, rollback, commit }) {
		const mutationKey = String(key || '');
		if (!mutationKey) return Promise.reject(new Error('Optimistic action key is required.'));
		const existing = this.active.get(mutationKey);
		if (existing) return existing;
		const id = transactionId();
		const promise = this.perform({
			id,
			mutationKey,
			apply,
			execute,
			rollback,
			commit
		});
		this.active.set(mutationKey, promise);
		return promise;
	}

	async perform({ id, mutationKey, apply, execute, rollback, commit }) {
		this.emit('start', { id, key: mutationKey });
		let snapshot;
		try {
			snapshot = await apply?.({ id });
			const result = await execute({ id, snapshot });
			await commit?.({ id, snapshot, result });
			this.emit('commit', { id, key: mutationKey, result });
			return result;
		} catch (error) {
			await rollback?.({ id, snapshot, error });
			this.emit('rollback', { id, key: mutationKey, error });
			throw error;
		} finally {
			this.active.delete(mutationKey);
		}
	}

	emit(type, detail) {
		this.dispatchEvent(new CustomEvent(type, { detail }));
	}
}
