//B"H
//Boruch Hashem
//Blessed is He
/**
 * @class InboxPanel
 * @description
 * The Awtsmoos lets multiple communication rivers meet in one attention flow while every read state remains source-truthful;
 * Awtsmoos.com refreshes overview and bridge items together, marks only the requested record, and follows canonical action URLs carefully.
 */
import { InboxView } from './InboxView.js';

export class InboxPanel {
	constructor({ root, state, api }) {
		Object.assign(this, { root, state, api });
		this.view = new InboxView(root);
		this.sequence = 0;
	}

	initialize() {
		this.view.ensurePanel();
	}

	async load() {
		const aliasId = this.state.snapshot().identity?.aliasId;
		const requestId = ++this.sequence;
		if (!aliasId) {
			this.view.message('Choose a verified alias to open the communications Inbox.');
			return;
		}
		this.view.message('Gathering Mail, Signals, and bridge threads…');
		try {
			const [overview, items] = await Promise.all([
				this.api.communicationsApi.overview(aliasId),
				this.api.communicationsApi.inbox(aliasId, 75)
			]);
			if (requestId !== this.sequence) return;
			this.view.summary(overview || {});
			this.view.items(items || [], item => this.open(item), item => void this.markRead(item));
		} catch (error) {
			if (requestId === this.sequence) {
				this.view.message(error.message || 'The communications Inbox is temporarily unavailable.');
			}
		}
	}

	open(item) {
		if (!item?.readAt) void this.markRead(item, false);
		if (item?.actionUrl && this.sameOriginPath(item.actionUrl)) {
			location.assign(item.actionUrl);
			return;
		}
		if (item?.threadId) {
			void this.openThread(item.threadId);
		}
	}

	async openThread(threadId) {
		const aliasId = this.state.snapshot().identity?.aliasId;
		if (!aliasId) return;
		this.view.message(`Opening thread ${threadId}…`);
		try {
			const items = await this.api.communicationsApi.thread(aliasId, threadId, 150);
			this.view.items(items || [], item => this.open(item), item => void this.markRead(item));
			await this.api.communicationsApi.markThreadRead(aliasId, threadId);
		} catch (error) {
			this.view.message(error.message || 'This bridge thread could not be opened.');
		}
	}

	async markRead(item, reload = true) {
		const aliasId = this.state.snapshot().identity?.aliasId;
		if (!aliasId || !item?.id) return;
		try {
			await this.api.communicationsApi.markItemRead(aliasId, item.id);
			if (reload) await this.load();
		} catch (error) {
			this.view.message(error.message || 'Read state could not be updated.');
		}
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
