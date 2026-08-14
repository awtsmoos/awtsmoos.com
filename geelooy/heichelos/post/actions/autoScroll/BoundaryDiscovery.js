// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module BoundaryDiscovery
 * @description The Awtsmoos locates punctuation and semantic vessels at the
 * chosen eye line, letting measured rests arise from the actual rendered text.
 */
export const BOUNDARY_PAUSES = Object.freeze({
	minor: 180,
	sentence: 320,
	paragraph: 520,
	verse: 800,
	heading: 1100
});
const BLOCK_SELECTOR = 'h1, h2, h3, h4, h5, h6, [data-verse], [data-awtsmoos-sub], .sub-awtsmoos, .section, p, li, blockquote';
const PUNCTUATION = /[,;:،؛.!?׃]/gu;

function absoluteBottom(node, eyeLineOffset) {
	const rectangle = node?.getBoundingClientRect?.();
	if (!rectangle || (!rectangle.width && !rectangle.height)) {
		return null;
	}
	return Number(globalThis.scrollY || 0) + rectangle.bottom - eyeLineOffset;
}

export function classifyBoundaryElement(element) {
	const tag = String(element?.tagName ?? '').toLowerCase();
	if (/^h[1-6]$/.test(tag)) {
		return 'heading';
	}
	if (element?.matches?.('[data-verse], [data-awtsmoos-sub], .sub-awtsmoos, .section')) {
		return 'verse';
	}
	return 'paragraph';
}

export function punctuationBoundaryKind(character) {
	return /[.!?׃]/u.test(character) ? 'sentence' : 'minor';
}

function punctuationBoundaries(root, eyeLineOffset) {
	const documentRef = root?.ownerDocument ?? globalThis.document;
	if (!documentRef?.createTreeWalker || !documentRef?.createRange) {
		return [];
	}
	const showText = globalThis.NodeFilter?.SHOW_TEXT ?? 4;
	const walker = documentRef.createTreeWalker(root, showText);
	const boundaries = [];
	let node = walker.nextNode();
	while (node) {
		if (!node.parentElement?.closest?.('button, input, textarea, select, [hidden]')) {
			for (const match of String(node.textContent ?? '').matchAll(PUNCTUATION)) {
				const range = documentRef.createRange();
				range.setStart(node, match.index);
				range.setEnd(node, match.index + 1);
				const position = absoluteBottom(range, eyeLineOffset);
				if (position !== null) {
					const kind = punctuationBoundaryKind(match[0]);
					boundaries.push({ position, kind, pauseMs: BOUNDARY_PAUSES[kind] });
				}
			}
		}
		node = walker.nextNode();
	}
	return boundaries;
}

function blockBoundaries(root, eyeLineOffset) {
	return [...(root?.querySelectorAll?.(BLOCK_SELECTOR) ?? [])]
		.map(element => {
			const position = absoluteBottom(element, eyeLineOffset);
			const kind = classifyBoundaryElement(element);
			return position === null ? null : { position, kind, pauseMs: BOUNDARY_PAUSES[kind] };
		})
		.filter(Boolean);
}

export function normalizeBoundaryCandidates(candidates, tolerance = 4) {
	const sorted = candidates
		.filter(item => Number.isFinite(item.position) && item.pauseMs > 0)
		.sort((left, right) => left.position - right.position);
	return sorted.reduce((result, candidate) => {
		const previous = result.at(-1);
		if (!previous || Math.abs(previous.position - candidate.position) > tolerance) {
			result.push({ ...candidate });
		} else if (candidate.pauseMs > previous.pauseMs) {
			result[result.length - 1] = { ...candidate };
		}
		return result;
	}, []);
}

export function discoverSemanticBoundaries(root, eyeLine = 0.42) {
	const viewportHeight = Number(globalThis.innerHeight || 0);
	const eyeLineOffset = viewportHeight * eyeLine;
	return normalizeBoundaryCandidates([
		...punctuationBoundaries(root, eyeLineOffset),
		...blockBoundaries(root, eyeLineOffset)
	]);
}
