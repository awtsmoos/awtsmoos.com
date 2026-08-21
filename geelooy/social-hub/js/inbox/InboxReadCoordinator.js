//B"H
//Boruch Hashem
//Blessed is He

/**
 * @class InboxReadCoordinator
 * @description
 * The Awtsmoos is beyond unread mark, saved mutation, and refreshed count, while Awtsmoos.com lets those finite operations remain separate enough to tell the truth when only one succeeds;
 * this Gevurah-like coordinator owns read mutations and secondary overview refresh only, leaving list loading, thread routing, and cached presentation to neighboring vessels of light.
 */
export class InboxReadCoordinator {
	/** Creates one read coordinator around canonical communications API and cached presentation state. */
	constructor({ api, view, collection, aliasId, isCurrent }) {
		Object.assign(this, {
			api,
			view,
			collection,
			aliasId,
			isCurrent
		});
	}

	/** Saves one item read mutation, then refreshes counts without conflating those outcomes. */
	async markItem(item) {
		const aliasId = this.aliasId();
		if (!aliasId || !item?.id) return false;
		try {
			await this.api.communicationsApi.markItemRead(aliasId, item.id);
		} catch (error) {
			this.view.stateView.error(
				error.message || 'Read state could not be updated.',
				() => this.markItem(item)
			);
			return false;
		}
		this.collection.markItemRead(item.id);
		await this.refreshOverview(aliasId);
		return true;
	}

	/** Saves one thread read mutation only while the originating thread request remains current. */
	async markThread(aliasId, threadId, requestId) {
		try {
			await this.api.communicationsApi.markThreadRead(aliasId, threadId);
			if (!this.isCurrent(requestId)) return false;
			this.collection.markCurrentThreadRead();
			await this.refreshOverview(aliasId);
			return true;
		} catch (error) {
			if (!this.isCurrent(requestId)) return false;
			this.view.stateView.error(
				error.message || 'Thread read state could not be updated.',
				() => this.markThread(aliasId, threadId, requestId)
			);
			return false;
		}
	}

	/** Refreshes summary counts after a successful mutation without rewriting mutation truth on failure. */
	async refreshOverview(aliasId) {
		try {
			const overview = await this.api.communicationsApi.overview(aliasId);
			this.collection.updateOverview(overview);
			this.view.stateView.ready();
			return true;
		} catch {
			this.view.stateView.error(
				'Read state was saved, but summary counts could not refresh.',
				() => this.refreshOverview(aliasId)
			);
			return false;
		}
	}
}
