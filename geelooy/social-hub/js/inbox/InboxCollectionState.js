//B"H
//Boruch Hashem
//Blessed is He

/**
 * @class InboxCollectionState
 * @description
 * The Awtsmoos is beyond cached overview, visible thread, unread mark, and rendered list, while Awtsmoos.com lets the last successful communication truth remain stable during future network motion;
 * this Yesod-like vessel owns cached presentation collections only, never transport, routing, or mutation policy in light.
 */
export class InboxCollectionState {
	constructor(view) {
		this.view = view;
		this.overview = {};
		this.cachedItems = [];
		this.currentItems = [];
		this.handlers = {};
	}

	/** Binds canonical open/read callbacks once so cache updates can rerender without controller leakage. */
	bind(handlers) {
		this.handlers = handlers || {};
	}

	/** Stores one successful overview/list response and renders overview mode. */
	storeOverview(overview, items) {
		this.overview = overview || {};
		this.cachedItems = items || [];
		this.renderOverview();
	}

	/** Stores one currently visible collection and renders it through the bound action callbacks. */
	renderItems(items) {
		this.currentItems = items || [];
		this.view.items(
			this.currentItems,
			this.handlers.onOpen,
			this.handlers.onRead
		);
	}

	/** Restores cached overview/list immediately without another network request. */
	renderOverview() {
		this.view.summary(this.overview || {});
		this.renderItems(this.cachedItems);
	}

	/** Replaces cached unread-count truth without disturbing the visible record collection. */
	updateOverview(overview) {
		this.overview = overview || {};
		this.view.summary(this.overview);
	}

	/** Marks one item visibly read in every cached/visible collection and rerenders current mode. */
	markItemRead(itemId) {
		const stamp = new Date().toISOString();
		const update = item => item.id === itemId
			? { ...item, readAt: item.readAt || stamp }
			: item;
		this.cachedItems = this.cachedItems.map(update);
		this.currentItems = this.currentItems.map(update);
		this.renderItems(this.currentItems);
	}

	/** Marks every currently visible thread record read and rerenders canonical read truth. */
	markCurrentThreadRead() {
		const stamp = new Date().toISOString();
		this.currentItems = this.currentItems.map(item => ({
			...item,
			readAt: item.readAt || stamp
		}));
		this.renderItems(this.currentItems);
	}
}
