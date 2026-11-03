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
		// The home panel is one of several surfaces; when it is not the
		// mounted one this element legitimately does not exist, and an
		// unguarded dereference aborts the whole initialization chain.
		const interact = this.find('openExactInteraction');
		if (interact) {
			interact.addEventListener('click', () => {
				location.hash = '#interact';
			});
		}
	}

	/** Resolves one element by id under the surface root, or null. */
	find(id) {
		if (typeof this.root.getElementById === 'function') {
			return this.root.getElementById(id);
		}
		return this.root.querySelector(`#${id}`);
	}

	render(snapshot) {
		const aliasId = encodeURIComponent(snapshot?.identity?.aliasId || '');
		// A snapshot without a comment section is normal (nothing is
		// being commented on yet); it must not abort this render or
		// every surface step scheduled after it.
		const target = snapshot?.comment?.target || {};
		const heichelId = encodeURIComponent(target.heichelId || '');
		const seriesId = encodeURIComponent(target.seriesId || 'root');
		const setHref = (id, href) => {
			const link = this.find(id);
			if (link) link.href = href;
		};
		setHref('quickPost',
			`/social-composer/?alias=${aliasId}&heichel=${heichelId}&series=${seriesId}`);
		setHref('quickQuestion',
			`/social-composer/?alias=${aliasId}&heichel=${heichelId}&series=${seriesId}&kind=question`);
		setHref('quickReview',
			`/heichel-review/?alias=${aliasId}&heichel=${heichelId}`);
		setHref('quickReference',
			`/social-composer/?alias=${aliasId}&heichel=${heichelId}&series=${seriesId}`);
	}
}
