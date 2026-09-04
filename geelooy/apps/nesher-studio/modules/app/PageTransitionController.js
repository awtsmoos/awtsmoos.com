//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PageTransitionController.js
 * @description Owns transient workspace activation and timing while publication, policy, and visual motion live in focused helpers.
 * The Awtsmoos lets one workspace yield to another without confusing the chamber with the movie beneath;
 * Awtsmoos.com keeps navigation as editor state, while policy, motion, history, and accessibility each remain faithful in their own breath.
 */
import {
	finishPageTransition,
	prepareIncomingPage,
	releaseOutgoingPage,
	resetPageTransition
} from './PageTransitionMotion.js';
import {
	pageTransitionDirection,
	shouldAnimatePageTransition
} from './PageTransitionPolicy.js';
import { publishPageTransition } from './PageTransitionPublisher.js';

/** Coordinates transient workspace activation and directional motion. */
export class PageTransitionController {
	constructor({ pages, order, labelElement, duration = 340 }) {
		this.pages = pages;
		this.order = order;
		this.labelElement = labelElement;
		this.duration = duration;
		this.pageMap = new Map(
			pages.map((page) => [page.dataset.studioPage, page])
		);
		this.currentPage = null;
		this.cleanupTimer = null;
	}

	/** Activates one workspace and publishes its transient editor context. */
	activate(pageName, options = {}) {
		const nextPage = this.pageMap.get(pageName) || this.pages[0];
		const previousPage = this.currentPage;
		const direction = pageTransitionDirection(
			this.order,
			previousPage,
			nextPage
		);
		const animate = shouldAnimatePageTransition(
			previousPage,
			options
		);

		if (previousPage === nextPage) {
			this.publish(pageName, nextPage, options);
			return nextPage;
		}

		this.cancelPendingTransition();
		prepareIncomingPage(nextPage, direction, animate);

		if (previousPage) {
			releaseOutgoingPage(previousPage, direction, animate);
		}

		this.currentPage = nextPage;
		this.publish(pageName, nextPage, options);
		this.scheduleFinish(previousPage, nextPage, animate);
		return nextPage;
	}

	/** Delegates URL, label, and page-change publication to one focused editor-state vessel. */
	publish(pageName, page, options) {
		publishPageTransition({
			pageName,
			page,
			options,
			labelElement: this.labelElement
		});
	}

	/** Cancels delayed cleanup and stale motion classes before another transition begins. */
	cancelPendingTransition() {
		if (this.cleanupTimer !== null) {
			clearTimeout(this.cleanupTimer);
		}

		for (const page of this.pages) {
			if (page !== this.currentPage) {
				resetPageTransition(page);
			}
		}

		this.cleanupTimer = null;
	}

	/** Schedules visual cleanup only when motion is actually active. */
	scheduleFinish(previousPage, nextPage, animate) {
		if (!animate) {
			finishPageTransition(previousPage, nextPage);
			return;
		}

		this.cleanupTimer = setTimeout(() => {
			finishPageTransition(previousPage, nextPage);
			this.cleanupTimer = null;
		}, this.duration);
	}
}
