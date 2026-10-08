//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file Whitespace geometry measurement.
 * @description Measures the VOID: how much of the viewport is empty, where the
 * vertical gaps fall, how much spacing each gap declared, and whether the page
 * is horizontally balanced. Pure geometry — no browser needed.
 */

import { unionArea, sortedByY } from "./layout.mjs";

/**
 * Measures whitespace in a normalized layout.
 * @param {{viewport, baseUnit, elements}} layout From normalizeLayout().
 * @returns {{
 *   viewportArea, coveredArea, whitespaceArea, ratio,
 *   gaps: [{between:[id,id], size, declared, accounted, top, bottom}],
 *   trailing: {size, declared, accounted},
 *   horizontal: {avgLeft, avgRight, balanced},
 *   baseUnit
 * }}
 */
export function measure(layout) {
	const { viewport, baseUnit, elements } = layout;
	const viewportArea = viewport.width * viewport.height;
	const coveredArea = unionArea(elements.map((e) => e.box));
	const whitespaceArea = Math.max(0, viewportArea - coveredArea);
	const ratio = viewportArea === 0 ? 0 : whitespaceArea / viewportArea;

	const ordered = sortedByY(elements);
	const gaps = [];
	for (let i = 0; i < ordered.length - 1; i++) {
		const a = ordered[i];
		const b = ordered[i + 1];
		const aBottom = a.box.y + a.box.h;
		const hOverlap =
			Math.min(a.box.x + a.box.w, b.box.x + b.box.w) -
			Math.max(a.box.x, b.box.x);
		// A vertical gap exists when b starts at/below a's bottom edge
		// and the two boxes share horizontal span.
		if (b.box.y >= aBottom - 1 && hOverlap > 0) {
			const size = Math.max(0, b.box.y - aBottom);
			const declared = a.margin.bottom + a.gapAfter + b.margin.top;
			gaps.push({
				between: [a.id, b.id],
				size,
				declared,
				accounted: Math.abs(size - declared) <= Math.max(1, 0.1 * Math.max(size, declared)),
				top: aBottom,
				bottom: b.box.y,
			});
		}
	}

	// Trailing dead space: viewport bottom below the lowest element.
	const lowest = ordered.reduce((m, e) => Math.max(m, e.box.y + e.box.h), 0);
	const trailingSize = Math.max(0, viewport.height - lowest);
	const lastEl = ordered.length > 0 ? ordered[ordered.length - 1] : null;
	const trailingDeclared = lastEl ? lastEl.margin.bottom : 0;
	const trailing = {
		size: trailingSize,
		declared: trailingDeclared,
		accounted:
			Math.abs(trailingSize - trailingDeclared) <=
			Math.max(1, 0.1 * Math.max(trailingSize, trailingDeclared)),
	};

	// Horizontal balance: average left vs right inset.
	let avgLeft = 0;
	let avgRight = 0;
	let balanced = true;
	if (elements.length > 0) {
		let sl = 0;
		let sr = 0;
		for (const e of elements) {
			sl += e.box.x;
			sr += viewport.width - (e.box.x + e.box.w);
		}
		avgLeft = sl / elements.length;
		avgRight = sr / elements.length;
		balanced = Math.abs(avgLeft - avgRight) <= baseUnit;
	}

	return {
		viewportArea,
		coveredArea,
		whitespaceArea,
		ratio,
		gaps,
		trailing,
		horizontal: { avgLeft, avgRight, balanced },
		baseUnit,
	};
}
