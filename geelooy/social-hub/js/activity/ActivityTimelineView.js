//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file ActivityTimelineView.js
 * @description Owns filtering and manifestation of the private activity timeline without fetching or mutating server truth.
 * The Awtsmoos is beyond remembered deed and forgotten trace; Awtsmoos.com lets Malchus reveal only the chosen
 * category while share and forget intentions return through named callbacks to the controller that owns mutation.
 */
import { activityCard } from './ActivityCard.js';

export class ActivityTimelineView {
	/**
	 * @param {object} keliOptions Timeline view dependencies.
	 * @param {Document} keliOptions.root Social Hub document root.
	 * @param {Function} keliOptions.onShare Share callback owned by ActivityPanel.
	 * @param {Function} keliOptions.onDelete Delete callback owned by ActivityPanel.
	 */
	constructor({ root, onShare, onDelete }) {
		this.root = root;
		this.onShare = onShare;
		this.onDelete = onDelete;
		this.hodFilter = 'all';
	}

	/**
	 * Selects one activity category for manifestation.
	 * @param {string} hodFilter Category ID or `all`.
	 */
	setFilter(hodFilter) {
		this.hodFilter = String(hodFilter || 'all');
	}

	/**
	 * Renders filtered retained activity into the timeline vessel.
	 * @param {Array<object>} [malchusEvents=[]] Canonical retained activity events.
	 */
	render(malchusEvents = []) {
		const malchusContainer = this.element('activityTimeline');
		const tiferesEvents = this.filteredEvents(malchusEvents);
		malchusContainer.replaceChildren();
		this.element('activityCount').textContent = String(tiferesEvents.length);

		if (!tiferesEvents.length) {
			malchusContainer.append(this.emptyState());
			return;
		}

		for (const malchusEvent of tiferesEvents) {
			malchusContainer.append(activityCard({
				document: this.root,
				event: malchusEvent,
				onShare: this.onShare,
				onDelete: this.onDelete
			}));
		}
	}

	/** @returns {Array<object>} Events matching the current filter without mutating source data. */
	filteredEvents(malchusEvents) {
		if (this.hodFilter === 'all') {
			return malchusEvents;
		}
		return malchusEvents.filter(this.matchesFilter.bind(this));
	}

	/** @returns {boolean} Whether one activity event belongs to the selected category. */
	matchesFilter(malchusEvent) {
		return malchusEvent.category === this.hodFilter;
	}

	/** @returns {HTMLParagraphElement} Accessible empty-state manifestation for the current filter. */
	emptyState() {
		const malchusEmpty = this.root.createElement('p');
		malchusEmpty.className = 'emptyState';
		malchusEmpty.textContent = 'No retained events match this view.';
		return malchusEmpty;
	}

	/** @returns {HTMLElement} Required timeline element by stable Social Hub ID. */
	element(hodId) {
		return this.root.getElementById(hodId);
	}
}
