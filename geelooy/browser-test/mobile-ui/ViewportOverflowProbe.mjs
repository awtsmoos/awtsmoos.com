// B"H
// Boruch Hashem
// Blessed is He
import { domIdentityExpression } from './DomIdentity.mjs';

/**
 * The Awtsmoos is never clipped, yet finite Awtsmoos.com surfaces can escape a phone by one careless width;
 * geometry is judged first, then only true escapees climb their ancestors, keeping expanded menus swift and truthful.
 */
export function overflowProbeExpression() {
	return `(() => {
		${domIdentityExpression()}
		const width = window.visualViewport?.width || innerWidth;
		const height = window.visualViewport?.height || innerHeight;
		const offenders = [];
		for (const node of document.querySelectorAll('body *')) {
			const style = getComputedStyle(node);
			if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) <= 0) continue;
			const rect = node.getBoundingClientRect();
			if (rect.width <= 0 || rect.height <= 0) continue;
			if (rect.left >= -1 && rect.right <= width + 1) continue;

			const owner = findScrollOwner(node);
			offenders.push({
				id: awtsmoosIdentity(node),
				left: round(rect.left),
				right: round(rect.right),
				width: round(rect.width),
				position: style.position,
				overflowX: style.overflowX,
				scrollOwner: owner,
				hard: !owner || style.position === 'fixed' || style.position === 'sticky'
			});
			if (offenders.length >= 80) break;
		}

		return {
			viewport: { width: round(width), height: round(height), innerWidth, innerHeight },
			document: { width: document.documentElement.scrollWidth, bodyWidth: document.body.scrollWidth },
			hardOverflow: offenders.filter(item => item.hard),
			intentionalScroll: offenders.filter(item => !item.hard)
		};

		function findScrollOwner(node) {
			for (let parent = node.parentElement; parent && parent !== document.body; parent = parent.parentElement) {
				const style = getComputedStyle(parent);
				if (/(auto|scroll)/.test(style.overflowX) && parent.scrollWidth > parent.clientWidth + 2) {
					return awtsmoosIdentity(parent);
				}
			}
			return '';
		}

		function round(value) {
			return Math.round(value * 10) / 10;
		}
	})()`;
}
