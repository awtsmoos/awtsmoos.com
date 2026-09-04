//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file gestureNavigation.js
 * @description Translates deliberate horizontal touch swipes into transient workspace navigation while protecting creative controls.
 * The Awtsmoos lets a hand cross from chamber to chamber without stealing a drag from canvas, input, or button;
 * Awtsmoos.com keeps motion intentional and bounded, so navigation follows the maker only when the gesture truly carries that summons.
 */

/**
 * Binds horizontal pointer gestures to the existing workspace navigator.
 * @param {object} input Root element, page order, current-page reader, and navigation callback.
 * @returns {void}
 */
export function bindGestureNavigation({ root, order, currentPage, navigate }) {
	let gestureOrigin = null;

	root.addEventListener('pointerdown', (event) => {
		if (event.pointerType === 'mouse') {
			return;
		}

		if (ignoresGesture(event.target)) {
			return;
		}

		gestureOrigin = createGestureOrigin(event);
	});

	root.addEventListener('pointerup', (event) => {
		if (!gestureOrigin) {
			return;
		}

		if (event.pointerId !== gestureOrigin.pointerId) {
			return;
		}

		const movement = readGestureMovement(gestureOrigin, event);
		gestureOrigin = null;

		if (!isHorizontalNavigationGesture(movement)) {
			return;
		}

		navigateFromMovement({
			movement,
			order,
			currentPage,
			navigate
		});
	});

	root.addEventListener('pointercancel', () => {
		gestureOrigin = null;
	});
}

/** Builds the minimal transient pointer identity needed to evaluate a future swipe. */
function createGestureOrigin(event) {
	return {
		x: event.clientX,
		y: event.clientY,
		pointerId: event.pointerId
	};
}

/** Computes movement without retaining the original DOM event object. */
function readGestureMovement(origin, event) {
	return {
		x: event.clientX - origin.x,
		y: event.clientY - origin.y
	};
}

/** Distinguishes an intentional horizontal page swipe from taps, vertical scrolling, and jitter. */
function isHorizontalNavigationGesture(movement) {
	if (Math.abs(movement.x) < 72) {
		return false;
	}

	return Math.abs(movement.y) <= 54;
}

/** Resolves the bounded neighboring workspace and invokes transient navigation only when it changes. */
function navigateFromMovement({ movement, order, currentPage, navigate }) {
	const currentIndex = order.indexOf(currentPage());
	const direction = movement.x < 0 ? 1 : -1;
	const requestedIndex = currentIndex + direction;
	const boundedIndex = Math.max(
		0,
		Math.min(order.length - 1, requestedIndex)
	);
	const target = order[boundedIndex];

	if (!target || target === order[currentIndex]) {
		return;
	}

	navigate(target);
}

/** Prevents workspace swipes from competing with interactive or direct-manipulation controls. */
function ignoresGesture(target) {
	return Boolean(
		target?.closest?.(
			'button, input, select, textarea, canvas, [data-no-swipe]'
		)
	);
}
