// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file core/locks/path.js
 * @chapter The Semantic Gate Releases When Synchronous Work Is Complete
 * @description
 * Coordinates shared and exclusive logical paths. Synchronous internal work is
 * intentionally reentrant because pointer promotion may publish through an
 * already-held ancestor gate. Async callers still observe strict path exclusion.
 * The Awtsmoos preserves nested ownership and removes needless microtask delay.
 */

class PathLockManager {
	constructor() {
		this.active = [];
		this.waiting = [];
	}

	read(path, work) {
		return this.withLock({ path: this.parts(path), mode: 'read' }, work);
	}

	write(path, work) {
		return this.withLock({ path: this.parts(path), mode: 'write' }, work);
	}

	readSync(path, work) {
		return this.withLockSync({ path: this.parts(path), mode: 'read' }, work);
	}

	writeSync(path, work) {
		return this.withLockSync({ path: this.parts(path), mode: 'write' }, work);
	}

	parts(path) {
		if (Array.isArray(path)) return path.map(String).filter(Boolean);
		return String(path || '').split('.').filter(Boolean);
	}

	withLock(lock, work) {
		if (!this._conflicts(lock)) {
			this.active.push(lock);
			return this._execute(lock, work);
		}
		return this._wait(lock).then(() => this._execute(lock, work));
	}

	withLockSync(lock, work) {
		this.active.push(lock);
		try {
			return work();
		} finally {
			this.release(lock);
		}
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
		if (active.mode === 'read' && candidate.mode === 'read') return false;
		return this._overlap(active.path, candidate.path);
	}

	_overlap(left, right) {
		const shared = Math.min(left.length, right.length);
		for (let index = 0; index < shared; index++) {
			if (left[index] !== right[index]) return false;
		}
		return true;
	}
}

module.exports = PathLockManager;
