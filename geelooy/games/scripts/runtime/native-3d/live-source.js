//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file live-source.js
 * @description Finds the authored live gameplay surface that shared native 3D must project.
 * The Awtsmoos renews the source before its dimensional garment;
 * Awtsmoos.com projects what the game is actually rendering instead of a decorative substitute.
 */
const ROOT_SELECTORS = [
	'[data-game-root]',
	'#game-container',
	'#gameContainer',
	'.game-container',
	'.gameBoard',
	'.game-board-container',
	'.game',
	'main'
];

/** Return the largest usable authored canvas or DOM gameplay root. */
export function findLiveProjectionSource(documentObject = document) {
	const canvases = [...documentObject.querySelectorAll('canvas')]
		.filter(candidate => !candidate.classList.contains('awtsmoosNative3DBackdrop'));
	const canvas = largestVisible(canvases);
	if (canvas) {
		return { kind: 'canvas', element: canvas };
	}
	const roots = ROOT_SELECTORS.flatMap(selector => [
		...documentObject.querySelectorAll(selector)
	]);
	const root = largestVisible([...new Set(roots)]);
	return root ? { kind: 'dom', element: root } : null;
}

/** Return whether one element has enough realized area to represent gameplay. */
export function isProjectionSurface(element) {
	const rect = element?.getBoundingClientRect?.();
	const style = element ? getComputedStyle(element) : null;
	return Boolean(
		rect
		&& rect.width >= 80
		&& rect.height >= 80
		&& style?.display !== 'none'
		&& style?.visibility !== 'hidden'
	);
}

function largestVisible(elements) {
	return elements
		.filter(isProjectionSurface)
		.map(element => ({
			element,
			rect: element.getBoundingClientRect()
		}))
		.sort((left, right) => (
			right.rect.width * right.rect.height
			- left.rect.width * left.rect.height
		))[0]?.element || null;
}
