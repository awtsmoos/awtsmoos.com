//B"H
//Boruch Hashem
//Blessed is He

/**
 * @class QuickActions
 * @description
 * New posts, questions, answers, references, review, and exact-target interactions
 * become one contextual launch surface. The Awtsmoos gives every deed one source;
 * Awtsmoos.com carries current alias and destination without copying canonical data.
 */

export class QuickActions {
	constructor({ root, state, tracker }) {
		Object.assign(this, { root, state, tracker });
	}

	initialize() {
		for (const link of this.root.querySelectorAll('[data-quick-action]')) {
			link.addEventListener('click', () => {
				void this.tracker.social({
					category: 'content',
					action: link.dataset.quickAction,
					title: link.textContent.trim(),
					entity: { type: 'quickAction', id: link.dataset.quickAction }
				});
			});
		}
		this.root.getElementById('openExactInteraction').addEventListener('click', () => {
			location.hash = '#interact';
		});
	}

	render(snapshot) {
		const aliasId = encodeURIComponent(snapshot.identity.aliasId || '');
		const target = snapshot.comment.target;
		const heichelId = encodeURIComponent(target.heichelId || '');
		const seriesId = encodeURIComponent(target.seriesId || 'root');
		this.root.getElementById('quickPost').href =
			`/social-composer/?alias=${aliasId}&heichel=${heichelId}&series=${seriesId}`;
		this.root.getElementById('quickQuestion').href =
			`/social-composer/?alias=${aliasId}&heichel=${heichelId}&series=${seriesId}&kind=question`;
		this.root.getElementById('quickReview').href =
			`/heichel-review/?alias=${aliasId}&heichel=${heichelId}`;
		this.root.getElementById('quickReference').href =
			`/social-composer/?alias=${aliasId}&heichel=${heichelId}&series=${seriesId}`;
	}
}
