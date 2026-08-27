//B"H
//Boruch Hashem
//Blessed is He

import { InboxCollectionState } from './InboxCollectionState.js';
import { InboxReadCoordinator } from './InboxReadCoordinator.js';
import { InboxView } from './InboxView.js';

/**
 * @class InboxPanel
 * @description
 * The Awtsmoos renews overview, bridge thread, return, and safe passage before one Inbox action can arise;
 * Awtsmoos.com lets this Tiferes-like controller orchestrate route-level attention while cache and read mutation live in focused neighboring vessels of light.
 */
export class InboxPanel {
	/** Creates one Inbox route controller around canonical Social state and communications API. */
	constructor({ root, state, api }) {
		Object.assign(this, { root, state, api });
		this.view = new InboxView(root);
		this.collection = new InboxCollectionState(this.view);
		this.sequence = 0;
		this.reads = new InboxReadCoordinator({
			api,
			view: this.view,
			collection: this.collection,
			aliasId: () => this.aliasId(),
			isCurrent: requestId => requestId === this.sequence
		});
	}

	/** Builds the panel once and binds cached collection actions to canonical controller operations. */
	initialize() {
		this.view.ensurePanel();
		this.collection.bind({
			onOpen: item => this.open(item),
			onRead: item => this.reads.markItem(item)
		});
	}

	/** Loads overview plus latest Inbox records while preserving previous successful content during refresh. */
	async load() {
		const aliasId = this.aliasId();
		const requestId = ++this.sequence;
		this.view.overview();
		if (!aliasId) {
			this.view.stateView.status('Choose a verified alias to open the communications Inbox.');
			return;
		}
		this.view.stateView.refreshing();
		try {
			const [overview, items] = await Promise.all([
				this.api.communicationsApi.overview(aliasId),
				this.api.communicationsApi.inbox(aliasId, 75)
			]);
			if (requestId !== this.sequence) return;
			this.collection.storeOverview(overview, items);
			this.view.stateView.ready();
		} catch (error) {
			if (requestId !== this.sequence) return;
			this.view.stateView.error(
				error.message || 'The communications Inbox is temporarily unavailable.',
				() => this.load()
			);
		}
	}

	/** Opens one item through safe same-origin navigation or its canonical bridge thread. */
	async open(item) {
		if (!item) return;
		if (!item.readAt) void this.reads.markItem(item);
		if (item.actionUrl && this.sameOriginPath(item.actionUrl)) {
			location.assign(item.actionUrl);
			return;
		}
		if (item.threadId) await this.openThread(item.threadId);
	}

	/** Opens one bounded bridge thread and applies stale-response protection. */
	async openThread(threadId) {
		const aliasId = this.aliasId();
		if (!aliasId || !threadId) return;
		const requestId = ++this.sequence;
		this.view.thread(threadId, () => this.backToOverview());
		this.view.stateView.refreshing('Opening bridge thread…');
		try {
			const items = await this.api.communicationsApi.thread(aliasId, threadId, 150);
			if (requestId !== this.sequence) return;
			this.collection.renderItems(items || []);
			this.view.stateView.ready();
			await this.reads.markThread(aliasId, threadId, requestId);
		} catch (error) {
			if (requestId !== this.sequence) return;
			this.view.stateView.error(
				error.message || 'This bridge thread could not be opened.',
				() => this.openThread(threadId)
			);
		}
	}

	/** Restores cached overview/list immediately and cancels any older in-flight thread response. */
	backToOverview() {
		this.sequence += 1;
		this.view.overview();
		this.collection.renderOverview();
		this.view.stateView.ready();
	}

	aliasId() {
		return this.state.snapshot().identity?.aliasId || '';
	}

	sameOriginPath(value) {
		try {
			const url = new URL(value, location.origin);
			return url.origin === location.origin && url.pathname.startsWith('/');
		} catch {
			return false;
		}
	}
}
