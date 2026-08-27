//B"H
//Boruch Hashem
//Blessed is He

/**
 * @class DraftAutosave
 * @description
 * The Awtsmoos lets thought flow without synchronous storage on every letter;
 * Awtsmoos.com gathers rapid changes into one quiet save pulse, preserving speed, history, and the creator's unbroken center.
 */
export class DraftAutosave {
	constructor({ state, localDrafts, history, onSaved, delay = 900 }) {
		Object.assign(this, { state, localDrafts, history, onSaved, delay });
		this.pending = null;
		this.timer = null;
	}

	initialize() {
		this.changeListener = event => this.schedule(event.detail.snapshot);
		this.pageListener = () => this.flush(this.state.snapshot());
		this.state.addEventListener('change', this.changeListener);
		window.addEventListener('pagehide', this.pageListener);
	}

	schedule(snapshot) {
		this.pending = snapshot;
		clearTimeout(this.timer);
		this.timer = setTimeout(() => this.flush(), this.delay);
	}

	flush(fallback = null) {
		clearTimeout(this.timer);
		this.timer = null;
		const snapshot = this.pending || fallback;
		this.pending = null;
		if (!snapshot) return false;
		const saved = this.localDrafts.save(snapshot);
		const version = saved ? this.history.save(snapshot) : null;
		this.onSaved?.({
			saved,
			savedAt: version?.savedAt || Date.now(),
			version
		});
		return saved;
	}

	destroy() {
		clearTimeout(this.timer);
		this.state.removeEventListener('change', this.changeListener);
		window.removeEventListener('pagehide', this.pageListener);
	}
}
