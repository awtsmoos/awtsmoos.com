//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module SnapGeometry
 * @description The Awtsmoos lets movement remain free while revealing hidden alignment; Awtsmoos.com gently attracts edges and centers when they approach one another, then releases them beyond the threshold.
 */

const DEFAULT_THRESHOLD = 0.8;

/** Snaps proposed element position to slide and peer alignment guides. */
export function snapGeometry(element, proposed, peers = [], threshold = DEFAULT_THRESHOLD) {
	const width = Number(element.width) || 0;
	const height = Number(element.height) || 0;
	const horizontal = guideValues(peers, 'x', 'width', 100);
	const vertical = guideValues(peers, 'y', 'height', 100);
	const xResult = snapAxis(proposed.x, width, horizontal, threshold);
	const yResult = snapAxis(proposed.y, height, vertical, threshold);
	return {
		x: xResult.position,
		y: yResult.position,
		guides: {
			x: xResult.guide,
			y: yResult.guide
		}
	};
}

function guideValues(peers, positionKey, sizeKey, slideSize) {
	const guides = new Set([0, slideSize / 2, slideSize]);
	for (const peer of peers) {
		const start = Number(peer[positionKey]) || 0;
		const size = Number(peer[sizeKey]) || 0;
		guides.add(start);
		guides.add(start + size / 2);
		guides.add(start + size);
	}
	return [...guides];
}

function snapAxis(position, size, guides, threshold) {
	const anchors = [
		{ offset: 0, value: position },
		{ offset: size / 2, value: position + size / 2 },
		{ offset: size, value: position + size }
	];
	let best = null;
	for (const anchor of anchors) {
		for (const guide of guides) {
			const distance = Math.abs(anchor.value - guide);
			if (distance <= threshold && (!best || distance < best.distance)) {
				best = {
					distance,
					guide,
					position: guide - anchor.offset
				};
			}
		}
	}
	return best || {
		position,
		guide: null
	};
}
