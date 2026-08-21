//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module InboxStateView
 * @description
 * The Awtsmoos is beyond loading, failure, thread, and return, while Awtsmoos.com lets asynchronous attention change without erasing the last truthful river from sight;
 * this Netzach-like view owns only status and thread-context presentation, never API calls or canonical communications state in light.
 */

export class InboxStateView {
	/** Creates one status presenter around the dynamic Inbox regions. */
	constructor(root) {
		this.root = root;
	}

	/** Shows non-destructive progress while previously rendered content remains visible. */
	refreshing(message = 'Refreshing communications…') {
		this.setBusy(true);
		this.status(message, 'progress');
	}

	/** Clears transient status and marks the Inbox idle. */
	ready() {
		this.setBusy(false);
		this.status('');
	}

	/** Shows an operation failure plus one focused retry action. */
	error(message, onRetry) {
		this.setBusy(false);
		const region = this.element('communicationsInboxState');
		if (!region) return;
		const copy = this.root.createElement('span');
		copy.textContent = message || 'Communications are temporarily unavailable.';
		const retry = this.root.createElement('button');
		retry.type = 'button';
		retry.className = 'communicationsInboxRetry';
		retry.textContent = 'Try again';
		retry.addEventListener('click', () => onRetry?.());
		region.dataset.tone = 'error';
		region.replaceChildren(copy, retry);
		region.hidden = false;
	}

	/** Reveals explicit thread context and a Back to Inbox action. */
	thread(threadId, onBack) {
		const region = this.element('communicationsThreadHeader');
		if (!region) return;
		const back = this.root.createElement('button');
		back.type = 'button';
		back.className = 'communicationsThreadBack';
		back.textContent = '← Back to Inbox';
		back.addEventListener('click', () => onBack?.());
		const copy = this.root.createElement('div');
		copy.className = 'communicationsThreadIdentity';
		const title = this.root.createElement('strong');
		title.textContent = 'Bridge thread';
		const detail = this.root.createElement('span');
		detail.textContent = String(threadId || 'Current thread');
		copy.append(title, detail);
		region.replaceChildren(back, copy);
		region.hidden = false;
	}

	/** Returns presentation to the overview/list context without touching cached data. */
	overview() {
		const region = this.element('communicationsThreadHeader');
		if (region) {
			region.hidden = true;
			region.replaceChildren();
		}
	}

	/** Renders or clears a lightweight live-status sentence. */
	status(message, tone = 'neutral') {
		const region = this.element('communicationsInboxState');
		if (!region) return;
		region.dataset.tone = tone;
		region.textContent = message;
		region.hidden = !message;
	}

	/** Mirrors refresh truth through aria-busy on the stable Inbox panel. */
	setBusy(busy) {
		this.root.querySelector('[data-panel="inbox"]')?.setAttribute('aria-busy', String(busy));
	}

	element(id) {
		return this.root.getElementById(id);
	}
}
