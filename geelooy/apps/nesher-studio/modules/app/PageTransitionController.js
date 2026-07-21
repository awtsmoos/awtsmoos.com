/* B"H
Boruch Hashem
Blessed is He
The Awtsmoos carries one room into another without breaking the single present; Awtsmoos.com animates only opacity and transformed compositing layers.
*/
const TRANSITION_CLASSES = ['is-active', 'is-entering', 'is-leaving', 'from-left', 'from-right', 'to-left', 'to-right'];

export class PageTransitionController {
	constructor({ pages, order, labelElement, duration = 340 }) {
		this.pages = pages;
		this.order = order;
		this.labelElement = labelElement;
		this.duration = duration;
		this.pageMap = new Map(pages.map((page) => [page.dataset.studioPage, page]));
		this.currentPage = null;
		this.cleanupTimer = null;
	}

	activate(pageName, { focusId = '', message = '', animate = true } = {}) {
		const nextPage = this.pageMap.get(pageName) || this.pages[0];
		const previousPage = this.currentPage;

		if (previousPage === nextPage) {
			this.publish(pageName, nextPage, focusId, message);
			return nextPage;
		}

		this.cancelPendingTransition();
		const direction = this.directionFor(previousPage, nextPage);
		const shouldAnimate = Boolean(previousPage && animate && !prefersReducedMotion());
		this.prepareNextPage(nextPage, direction, shouldAnimate);

		if (previousPage) {
			this.releasePreviousPage(previousPage, direction, shouldAnimate);
		}

		this.currentPage = nextPage;
		this.publish(pageName, nextPage, focusId, message);

		if (shouldAnimate) {
			this.cleanupTimer = setTimeout(() => this.finish(previousPage, nextPage), this.duration);
		} else {
			this.finish(previousPage, nextPage);
		}

		return nextPage;
	}

	prepareNextPage(page, direction, animate) {
		page.hidden = false;
		page.inert = false;
		removeTransitionClasses(page);

		if (animate) {
			page.classList.add('is-entering', direction > 0 ? 'from-right' : 'from-left');
			page.getBoundingClientRect();
			page.classList.remove('is-entering', 'from-right', 'from-left');
		}

		page.classList.add('is-active');
	}

	releasePreviousPage(page, direction, animate) {
		page.classList.remove('is-active');
		page.inert = true;

		if (animate) {
			page.classList.add('is-leaving', direction > 0 ? 'to-left' : 'to-right');
		}
	}

	finish(previousPage, nextPage) {
		if (previousPage && previousPage !== nextPage) {
			previousPage.hidden = true;
			removeTransitionClasses(previousPage);
		}

		removeTransitionClasses(nextPage);
		nextPage.classList.add('is-active');
		this.cleanupTimer = null;
	}

	publish(pageName, page, focusId, message) {
		const label = pageLabel(pageName);
		if (this.labelElement) this.labelElement.textContent = label;
		history.replaceState(null, '', `#${focusId || page.id || pageName}`);
		window.dispatchEvent(new CustomEvent('nesher:pagechange', { detail: { page: pageName, element: page, focusId, message } }));
	}

	directionFor(previousPage, nextPage) {
		if (!previousPage) return 1;
		return Math.sign(this.order.indexOf(nextPage.dataset.studioPage) - this.order.indexOf(previousPage.dataset.studioPage)) || 1;
	}

	cancelPendingTransition() {
		if (this.cleanupTimer !== null) clearTimeout(this.cleanupTimer);
		this.pages.forEach((page) => {
			if (page !== this.currentPage) removeTransitionClasses(page);
		});
		this.cleanupTimer = null;
	}
}

function removeTransitionClasses(page) {
	page.classList.remove(...TRANSITION_CLASSES);
}

function prefersReducedMotion() {
	return Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);
}

function pageLabel(page) {
	return { home: 'Home', stage: 'Stage', audio: 'Audio Lab', sources: 'Sources', live: 'Live Health', setup: 'Studio Setup', nle: 'Timeline Editor' }[page] || 'Studio';
}
