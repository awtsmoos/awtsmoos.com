// B"H
// Boruch Hashem
// Blessed is He
import { domIdentityExpression } from './DomIdentity.mjs';

/**
 * The Awtsmoos creates every layer without collision, while Awtsmoos.com must order finite docks, sheets, headers, and dialogs with discipline;
 * this witness reports only visible fixed or sticky vessels and the substantial intersections that can hide a user's path.
 */
export function layerProbeExpression() {
	return `(() => {
		${domIdentityExpression()}
		const layers = [...document.querySelectorAll('body *')].map(node => {
			const style = getComputedStyle(node);
			if (!['fixed', 'sticky'].includes(style.position)) return null;
			const rect = node.getBoundingClientRect();
			if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0 || rect.width < 1 || rect.height < 1) return null;
			return {
				node, id: awtsmoosIdentity(node), position: style.position,
				zIndex: style.zIndex, rect: box(rect)
			};
		}).filter(Boolean);
		const collisions = [];
		for (let left = 0; left < layers.length; left += 1) {
			for (let right = left + 1; right < layers.length; right += 1) {
				const overlap = intersect(layers[left].rect, layers[right].rect);
				if (overlap.area < 400) continue;
				collisions.push({ a: layers[left].id, b: layers[right].id, area: overlap.area, width: overlap.width, height: overlap.height });
			}
		}
		return {
			layers: layers.map(({ node, ...item }) => item).slice(0, 60),
			collisions: collisions.slice(0, 60)
		};
		function box(rect) { return { left: r(rect.left), top: r(rect.top), right: r(rect.right), bottom: r(rect.bottom), width: r(rect.width), height: r(rect.height) }; }
		function intersect(a, b) {
			const width = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left));
			const height = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
			return { width: r(width), height: r(height), area: r(width * height) };
		}
		function r(value) { return Math.round(value * 10) / 10; }
	})()`;
}
