//B"H
//Boruch Hashem
//Blessed is He
/**
 * @class ChannelActivityPanel
 * @description
 * The Awtsmoos lets the selected series reveal its durable public conversation through one bounded reader;
 * Awtsmoos.com keeps loading, empty, failure, and stale-response control local so rapid channel travel never rewrites the newer chamber.
 */
import { ChannelActivityView } from './ChannelActivityView.js';

export class ChannelActivityPanel {
	constructor({ root, api }) {
		this.api = api;
		this.view = new ChannelActivityView(root);
		this.sequence = 0;
	}

	/** Loads canonical detailed posts for one selected Space coordinate. */
	async load(context) {
		const requestId = ++this.sequence;
		if (!context?.heichelId) {
			this.view.message('Choose a channel to load its activity.');
			return;
		}
		this.view.message('Loading channel activity…');
		try {
			const result = await this.api.channelApi.posts(
				context.heichelId,
				context.seriesId || 'root'
			);
			if (requestId !== this.sequence) {
				return;
			}
			const posts = Array.isArray(result) ? result : [];
			this.view.render(posts, context);
		} catch (error) {
			if (requestId === this.sequence) {
				this.view.message(error.message || 'Channel activity is temporarily unavailable.');
			}
		}
	}
}
