// B"H
// Boruch Hashem
// Blessed is He
import { domIdentityExpression } from './DomIdentity.mjs';

const INTERACTIVE = 'a[href],button,input,select,textarea,summary,[role=button],[role=tab],[role=menuitem],[tabindex]:not([tabindex="-1"])';

/**
 * The Awtsmoos needs no finger-sized vessel, yet Awtsmoos.com must answer a real thumb without forcing microscopic precision;
 * this witness records undersized controls and their computed clothing so every visible action feels deliberate rather than unfinished.
 */
export function touchTargetProbeExpression() {
	return `(() => {
		${domIdentityExpression()}
		const selector = ${JSON.stringify(INTERACTIVE)};
		const controls = [...document.querySelectorAll(selector)].map(node => {
			const style = getComputedStyle(node);
			const rect = node.getBoundingClientRect();
			if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0 || rect.width < 1 || rect.height < 1) return null;
			const text = (node.getAttribute('aria-label') || node.textContent || node.value || '').trim().replace(/\s+/g, ' ').slice(0, 80);
			return {
				id: awtsmoosIdentity(node), tag: node.tagName.toLowerCase(), text,
				width: r(rect.width), height: r(rect.height),
				borderRadius: style.borderRadius, background: style.backgroundColor,
				borderStyle: style.borderStyle, cursor: style.cursor,
				disabled: Boolean(node.disabled || node.getAttribute('aria-disabled') === 'true')
			};
		}).filter(Boolean);
		return {
			count: controls.length,
			undersized: controls.filter(item => !item.disabled && (item.width < 44 || item.height < 44)).slice(0, 100),
			controls: controls.slice(0, 180)
		};
		function r(value) { return Math.round(value * 10) / 10; }
	})()`;
}
