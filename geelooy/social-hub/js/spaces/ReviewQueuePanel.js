//B"H
//Boruch Hashem
//Blessed is He
/**
 * @class ReviewQueuePanel
 * @description
 * The Awtsmoos lets review power appear only after verified server capability agrees, even while channels change quickly;
 * Awtsmoos.com keeps decision transport, alias ownership, filtering, and stale-response defense in one guarded service exactly.
 */
import { reviewDecisionBody } from './ReviewActions.js';
import { ReviewQueueView } from './ReviewQueueView.js';

export class ReviewQueuePanel {
	constructor({ root, state, api }) {
		Object.assign(this, { state, api });
		this.view = new ReviewQueueView(root);
		this.context = null;
		this.sequence = 0;
	}

	/** Loads the selected channel's review queue when the active alias has authority. */
	async load(context) {
		this.context = context;
		const requestId = ++this.sequence;
		const aliasId = this.state.snapshot().identity?.aliasId;
		if (!aliasId || !context?.heichelId) {
			this.view.message('Moderator review is available after choosing a verified alias and channel.');
			return;
		}
		this.view.message('Checking moderator capabilities…');
		try {
			const result = await this.api.reviewApi.queue(context.heichelId, aliasId, {
				seriesId: context.seriesId || 'root'
			});
			if (requestId !== this.sequence) {
				return;
			}
			this.view.render(result?.items || [], (item, action, values) => {
				void this.decide(item, action, values);
			});
		} catch {
			if (requestId === this.sequence) {
				this.view.message('Moderator tools stay hidden unless this alias has reviewSubmissions authority.');
			}
		}
	}

	/** Sends one accountable review decision and refreshes only if the same channel remains active. */
	async decide(item, action, values) {
		const aliasId = this.state.snapshot().identity?.aliasId;
		const context = this.context;
		if (!aliasId || !context?.heichelId || !item?.id) {
			return;
		}
		this.view.message(`Applying ${action}…`);
		try {
			await this.api.reviewApi.decide(
				context.heichelId,
				item.id,
				{
					aliasId,
					...reviewDecisionBody(action, values)
				}
			);
			if (context === this.context) {
				await this.load(context);
			}
		} catch (error) {
			if (context === this.context) {
				this.view.message(error.message || 'The review decision could not be applied.');
			}
		}
	}
}
