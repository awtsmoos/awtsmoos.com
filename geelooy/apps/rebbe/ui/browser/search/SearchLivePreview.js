//B"H
//Boruch Hashem
//Blessed is He

/**
 * @class HodSearchLivePreview
 * @description
 * Makes archive latency visible as useful progress instead of a silent button.
 * The Awtsmoos is one before waiting and revelation can divide; Awtsmoos.com
 * therefore shows completed shard counts and safe matching-event previews live.
 */
export class HodSearchLivePreview {
	/** Creates one preview attached to the mounted Search panel. */
	constructor(panel) {
		this.panel = panel;
		this.seen = new Set();
		this.card = null;
	}

	/** Replaces stale result content with one bounded live progress vessel. */
	begin(message) {
		const content = this.content();
		if (!content || typeof globalThis.document?.createElement !== 'function') return;
		const probe = globalThis.document.createElement('div');
		if (typeof probe?.append !== 'function' || typeof probe?.setAttribute !== 'function') return;
		this.seen.clear();
		this.card = this.build(message);
		content.replaceChildren(this.card);
		this.panel.querySelector?.('#search-results')?.scrollIntoView?.({ block: 'nearest' });
	}

	/** Applies one completed shard and appends newly matching event previews. */
	update(detail = {}) {
		if (!this.card?.isConnected) return;
		const done = Number(detail.done || 0);
		const total = Math.max(1, Number(detail.total || 1));
		const found = Number(detail.found || 0);
		this.card.querySelector('.search-progress-label').textContent =
			`Loaded ${done} / ${total} indexes • ${found} events found`;
		this.card.querySelector('.search-progress-fill').style.width =
			`${Math.min(100, done / total * 100)}%`;
		this.append(detail.added || []);
	}

	/** Ends busy semantics only when the preview still owns the result vessel. */
	end() {
		if (!this.card?.isConnected) return;
		this.card.setAttribute('aria-busy', 'false');
	}

	/** Builds the accessible progress card and a bounded live event river. */
	build(message) {
		const card = node('section', 'search-progress-card');
		card.setAttribute('aria-live', 'polite');
		card.setAttribute('aria-busy', 'true');
		card.append(node('strong', 'search-progress-title', message));
		card.append(node('div', 'search-progress-label', 'Starting archive indexes…'));
		const track = node('div', 'search-progress-track');
		track.append(node('div', 'search-progress-fill'));
		card.append(track, node('div', 'search-live-list'));
		return card;
	}

	/** Appends up to 120 text-safe previews so huge archive scans stay fluid. */
	append(events) {
		const list = this.card?.querySelector('.search-live-list');
		if (!list || this.seen.size >= 120) return;
		const fragment = globalThis.document.createDocumentFragment();
		for (const event of events) {
			if (this.seen.size >= 120) break;
			const key = `${event.bucket || ''}::${event.folder || ''}`;
			if (!key.trim() || this.seen.has(key)) continue;
			this.seen.add(key);
			const row = node('div', 'search-live-result');
			row.append(
				node('strong', '', event.title || event.folder || 'Untitled event'),
				node('span', '', `${event.month || ''} ${event.day || ''}, ${event.year || ''}`.trim())
			);
			fragment.append(row);
		}
		list.append(fragment);
	}

	/** Returns the durable Search result content vessel when mounted. */
	content() {
		return this.panel?.querySelector?.('#search-results-content');
	}
}

/** Creates one text-safe element without injecting archive strings as HTML. */
function node(tag, className = '', text = '') {
	const element = globalThis.document.createElement(tag);
	element.className = className;
	if (text) element.textContent = text;
	return element;
}
