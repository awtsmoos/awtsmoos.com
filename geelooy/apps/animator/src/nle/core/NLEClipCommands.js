// B"H
// Boruch Hashem
// Blessed is He

/**
 * Clips are measured vessels of created time. These focused commands preserve
 * identity, timing, payload, and history while the Awtsmoos renews every frame.
 */
export class NLEClipCommands {
	/** Adds and selects one normalized clip. */
	static add(store, clip) {
		let created = null;
		this.edit(store, (state) => {
			created = {
				id: clip.id || this.nextId('clip'),
				trackId: clip.trackId,
				entityId: clip.entityId || null,
				start: Math.max(0, Number(clip.start) || 0),
				duration: Math.max(100, Number(clip.duration) || 1000),
				type: clip.type || 'action',
				name: clip.name || clip.type || 'Clip',
				payload: clip.payload || {},
				transform: { ...(clip.transform || {}) }
			};
			return { clips: [...state.clips, created], selectedClipId: created.id };
		});
		return created;
	}

	/** Moves one clip to a nonnegative start and optional destination track. */
	static move(store, id, start, trackId = null) {
		this.edit(store, (state) => ({
			clips: state.clips.map((clip) => clip.id === id
				? { ...clip, start: Math.max(0, Number(start) || 0), trackId: trackId || clip.trackId }
				: clip)
		}));
	}

	/** Trims one clip while preserving a visible editable duration. */
	static trim(store, id, duration) {
		this.edit(store, (state) => ({
			clips: state.clips.map((clip) => clip.id === id
				? { ...clip, duration: Math.max(100, Number(duration) || 100) }
				: clip)
		}));
	}

	/** Splits at an absolute timeline time and selects the right half. */
	static split(store, id, timeMs = store.get().playhead) {
		const source = store.findClip(id);
		if (!source || timeMs <= source.start || timeMs >= source.start + source.duration) {
			return null;
		}
		const right = {
			...source,
			id: this.nextId('clip'),
			start: timeMs,
			duration: source.start + source.duration - timeMs,
			name: `${source.name} • B`
		};
		this.edit(store, (state) => ({
			clips: [...state.clips.map((clip) => clip.id === id
				? { ...clip, duration: timeMs - source.start, name: `${source.name} • A` }
				: clip), right],
			selectedClipId: right.id
		}));
		return right;
	}

	/** Duplicates one clip at a snapped offset. */
	static duplicate(store, id, offset = null) {
		const source = store.findClip(id);
		if (!source) {
			return null;
		}
		return this.add(store, {
			...source,
			id: this.nextId('clip'),
			start: source.start + (offset ?? store.get().snap ?? 100),
			name: `${source.name} Copy`,
			payload: { ...source.payload },
			transform: { ...source.transform }
		});
	}

	/** Deletes one clip without moving neighboring material. */
	static remove(store, id) {
		this.edit(store, (state) => ({
			clips: state.clips.filter((clip) => clip.id !== id),
			selectedClipId: state.selectedClipId === id ? null : state.selectedClipId
		}));
	}

	/** Deletes one clip and closes its gap on the same track. */
	static rippleRemove(store, id) {
		const source = store.findClip(id);
		if (!source) {
			return;
		}
		const end = source.start + source.duration;
		this.edit(store, (state) => ({
			clips: state.clips.filter((clip) => clip.id !== id).map((clip) => {
				const follows = clip.trackId === source.trackId && clip.start >= end;
				return follows ? { ...clip, start: clip.start - source.duration } : clip;
			}),
			selectedClipId: null
		}));
	}

	static edit(store, updater) {
		return typeof store.transact === 'function' ? store.transact(updater) : store.set(updater);
	}

	static nextId(prefix) {
		this.sequence = (this.sequence || 0) + 1;
		return `${prefix}_${Date.now()}_${this.sequence}`;
	}
}
