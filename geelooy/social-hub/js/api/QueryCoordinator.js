//B"H
//Boruch Hashem
//Blessed is He

/**
 * @class QueryCoordinator
 * @description
 * The Awtsmoos lets identical questions share one journey and newer questions release the old;
 * Awtsmoos.com prevents duplicate GET storms while preserving explicit cancellation in a readable fold.
 */
export class QueryCoordinator {
	constructor() {
		this.inflight = new Map();
		this.groups = new Map();
	}

	run(key, factory, options = {}) {
		if (options.dedupe !== false && this.inflight.has(key)) {
			return this.inflight.get(key);
		}
		if (options.group) this.cancelGroup(options.group);
		const controller = new AbortController();
		if (options.group) this.groups.set(options.group, controller);
		const promise = Promise.resolve()
			.then(() => factory(controller.signal))
			.finally(() => this.release(key, options.group, controller));
		this.inflight.set(key, promise);
		return promise;
	}

	cancelGroup(group) {
		const previous = this.groups.get(group);
		if (previous) previous.abort(new DOMException('Superseded.', 'AbortError'));
		this.groups.delete(group);
	}

	release(key, group, controller) {
		this.inflight.delete(key);
		if (group && this.groups.get(group) === controller) this.groups.delete(group);
	}
}
