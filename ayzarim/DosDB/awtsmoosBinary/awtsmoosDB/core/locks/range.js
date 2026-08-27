// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file core/locks/range.js
 * @chapter The Gate Releases As Soon As Synchronous Work Is Complete
 * @description
 * Coordinates shared and exclusive byte ranges. Synchronous callbacks complete
 * and release inside the calling turn, avoiding a growing active-lock crowd;
 * genuine promises retain their locks until settlement. The Awtsmoos preserves
 * every overlap boundary while removing needless microtask and quadratic cost.
 */

class RangeLockManager {
	constructor() {
		this.active = [];
		this.waiting = [];
	}

	read(resource, offset, length, work) {
		return this.withLock({ resource, offset, length, mode: 'read' }, work);
	}

	write(resource, offset, length, work) {
		return this.withLock({ resource, offset, length, mode: 'write' }, work);
	}

	withLock(lock, work) {
		this._normalize(lock);
		if (!this._conflicts(lock)) {
			this.active.push(lock);
			return this._execute(lock, work);
		}
		return this._wait(lock).then(() => this._execute(lock, work));
	}

	_wait(lock) {
		return new Promise(resolve => {
			this.waiting.push({ lock, resolve });
		});
	}

	_execute(lock, work) {
		let result;
		try {
			result = work();
		} catch (error) {
			this.release(lock);
			return Promise.reject(error);
		}

		if (!result || typeof result.then !== 'function') {
			this.release(lock);
			return Promise.resolve(result);
		}
		return Promise.resolve(result).then(
			value => {
				this.release(lock);
				return value;
			},
			error => {
				this.release(lock);
				throw error;
			}
		);
	}

	release(lock) {
		const index = this.active.indexOf(lock);
		if (index !== -1) this.active.splice(index, 1);
		this._drain();
	}

	_drain() {
		for (let index = 0; index < this.waiting.length; index++) {
			const item = this.waiting[index];
			if (this._conflicts(item.lock)) continue;
			this.waiting.splice(index, 1);
			this.active.push(item.lock);
			item.resolve();
			index--;
		}
	}

	_conflicts(lock) {
		return this.active.some(active => this._blocks(active, lock));
	}

	_blocks(active, candidate) {
		if (active.resource !== candidate.resource) return false;
		if (active.mode === 'read' && candidate.mode === 'read') return false;
		return active.offset < candidate.offset + candidate.length
			&& candidate.offset < active.offset + active.length;
	}

	_normalize(lock) {
		lock.offset = Math.max(0, Number(lock.offset || 0));
		lock.length = Math.max(1, Number(lock.length || 0));
	}
}

module.exports = RangeLockManager;
