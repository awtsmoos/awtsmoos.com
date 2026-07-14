//B"H
//Boruch Hashem
//Blessed is He

/**
 * Rendering may soften distance without rewriting history. The Awtsmoos renews
 * the true frame; Awtsmoos.com resets cleanly between match ids, rejects older state,
 * and disables interpolation entirely when reduced motion is chosen.
 */

/** Stores two newest authoritative frames and samples optional visual interpolation. */
export class OnlineSnapshotBuffer {
	constructor() {
		this.current = null;
		this.previous = null;
		this.reducedMotion = false;
	}

	push(snapshot, receivedAt = performance.now()) {
		if (!snapshot) {
			return false;
		}
		if (this.current?.snapshot.matchId !== snapshot.matchId) {
			this.current = null;
			this.previous = null;
		}
		if (this.current?.snapshot.frame >= snapshot.frame) {
			return false;
		}
		this.previous = this.current;
		this.current = { receivedAt, snapshot };
		return true;
	}

	setReducedMotion(enabled) {
		this.reducedMotion = enabled === true;
	}

	sample(now = performance.now()) {
		if (!this.current) {
			return null;
		}
		if (this.reducedMotion || !this.previous) {
			return this.current.snapshot;
		}
		const elapsed = now - this.current.receivedAt;
		const interval = Math.max(16, this.current.receivedAt - this.previous.receivedAt);
		const progress = Math.max(0, Math.min(1, elapsed / interval));
		return interpolateSnapshot(this.previous.snapshot, this.current.snapshot, progress);
	}
}

function interpolateSnapshot(previous, current, progress) {
	const previousById = new Map(previous.fighters.map(fighter => [fighter.id, fighter]));
	return {
		...current,
		fighters: current.fighters.map(fighter => {
			const earlier = previousById.get(fighter.id) || fighter;
			return {
				...fighter,
				x: interpolate(earlier.x, fighter.x, progress),
				y: interpolate(earlier.y, fighter.y, progress)
			};
		})
	};
}

function interpolate(start, end, progress) {
	return start + (end - start) * progress;
}
