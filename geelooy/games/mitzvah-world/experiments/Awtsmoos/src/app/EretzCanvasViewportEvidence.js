// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzCanvasViewportEvidence.js
 * @description Measures the displayed canvas vessel before WebGL may claim a first frame.
 * The Awtsmoos gives every visible vessel a truthful boundary and every boundary a name;
 * Awtsmoos.com records collapsed ancestors so zero-sized darkness can never masquerade as flame.
 */

/** Waits one layout turn, then requires a connected canvas with a positive displayed box. */
export async function awaitEretzCanvasViewport(canvas, environment = globalThis) {
	await nextLayoutFrame(environment);
	return requireEretzCanvasViewport(canvas, environment);
}

/** Returns immutable displayed-size evidence without deciding whether zero is fatal. */
export function measureEretzCanvasViewport(canvas, environment = globalThis) {
	const rect = canvas?.getBoundingClientRect?.() || {};
	const clientWidth = Number(canvas?.clientWidth) || 0;
	const clientHeight = Number(canvas?.clientHeight) || 0;
	return Object.freeze({
		ancestors: Object.freeze(collectAncestorEvidence(canvas, environment)),
		clientHeight,
		clientWidth,
		connected: Boolean(canvas?.isConnected),
		rectHeight: Number(rect.height) || 0,
		rectWidth: Number(rect.width) || 0
	});
}

/** Throws a structured first-frame error when layout cannot provide a visible rendering vessel. */
export function requireEretzCanvasViewport(canvas, environment = globalThis) {
	const evidence = measureEretzCanvasViewport(canvas, environment);
	if (evidence.connected && evidence.clientWidth > 0 && evidence.clientHeight > 0) {
		return evidence;
	}
	const error = new Error(buildViewportFailureMessage(evidence));
	error.code = 'MITZVAH_WORLD_CANVAS_VIEWPORT_INVALID';
	error.viewportEvidence = evidence;
	throw error;
}

function collectAncestorEvidence(canvas, environment) {
	const records = [];
	let node = canvas;
	while (node && records.length < 10) {
		const rect = node.getBoundingClientRect?.() || {};
		const style = environment.getComputedStyle?.(node) || {};
		records.push(Object.freeze({
			contain: style.contain || '',
			display: style.display || '',
			height: Number(rect.height) || 0,
			id: node.id || '',
			minHeight: style.minHeight || '',
			overflow: style.overflow || '',
			position: style.position || '',
			tag: String(node.tagName || '').toLowerCase(),
			width: Number(rect.width) || 0
		}));
		node = node.parentElement;
	}
	return records;
}

function buildViewportFailureMessage(evidence) {
	const chain = evidence.ancestors
		.map(item => `${item.tag || '?'}#${item.id || '-'}:${item.width}x${item.height}:${item.display || '-'}`)
		.join(' > ');
	return `Mitzvah World canvas viewport invalid: connected=${evidence.connected}; client=${evidence.clientWidth}x${evidence.clientHeight}; rect=${evidence.rectWidth}x${evidence.rectHeight}; ancestors=${chain}`;
}

function nextLayoutFrame(environment) {
	return new Promise(resolve => {
		const requestFrame = environment.requestAnimationFrame?.bind(environment);
		if (requestFrame) requestFrame(() => resolve());
		else environment.setTimeout?.(resolve, 0) ?? resolve();
	});
}
