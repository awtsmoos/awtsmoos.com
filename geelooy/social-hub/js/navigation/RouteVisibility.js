//B"H
//Boruch Hashem
//Blessed is He

/**
 * @class NetzachRouteVisibility
 * @description
 * The Awtsmoos lets every chosen road remain visible even when the mobile dock flows beyond one screen;
 * Awtsmoos.com centers only the hidden active vessel, preserving calm motion, reduced-motion truth, and the page between.
 */
export class NetzachRouteVisibility {
	constructor(root = document) {
		this.root = root;
	}

	reveal(routeId) {
		const container = this.root.getElementById('mobileNavigation');
		const button = this.routeButton(container, routeId);
		if (!container || !button) {
			return;
		}
		requestAnimationFrame(() => this.centerIfClipped(container, button));
	}

	routeButton(container, routeId) {
		if (!container) {
			return null;
		}
		return [...container.querySelectorAll('[data-route]')]
			.find(button => button.dataset.route === routeId) || null;
	}

	centerIfClipped(container, button) {
		const containerBox = container.getBoundingClientRect();
		const buttonBox = button.getBoundingClientRect();
		const edge = 10;
		const clipped = buttonBox.left < containerBox.left + edge
			|| buttonBox.right > containerBox.right - edge;
		if (!clipped) {
			return;
		}
		const desired = button.offsetLeft
			+ (button.offsetWidth / 2)
			- (container.clientWidth / 2);
		const maximum = Math.max(0, container.scrollWidth - container.clientWidth);
		const left = Math.min(maximum, Math.max(0, desired));
		this.scroll(container, left);
	}

	scroll(container, left) {
		if (typeof container.scrollTo !== 'function') {
			container.scrollLeft = left;
			return;
		}
		container.scrollTo({
			left,
			behavior: this.motionBehavior()
		});
	}

	motionBehavior() {
		return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
			? 'auto'
			: 'smooth';
	}
}
