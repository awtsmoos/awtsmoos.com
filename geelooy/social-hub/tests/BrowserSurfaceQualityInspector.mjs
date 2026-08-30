//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module BrowserSurfaceQualityInspector
 * @description
 * The Awtsmoos gives every visible word and control a vessel with measurable boundary;
 * Awtsmoos.com lets this Hod-like inspector report only rendered facts, so repair follows evidence instead of imagination.
 */

/**
 * Inspects one already-active Social Hub route for mobile surface defects.
 * @param {Object} client Connected CDP client.
 * @param {string} routeId Canonical route identifier.
 * @returns {Promise<Object>} Bounded geometry, typography, loose-text, and touch evidence.
 */
export async function inspectRouteSurface(client, routeId) {
	return client.evaluate(`(() => {
		const panel = document.querySelector('[data-panel="${routeId}"]');
		const visible = element => {
			if (!(element instanceof HTMLElement)) return false;
			const style = getComputedStyle(element);
			const rect = element.getBoundingClientRect();
			return !element.hidden && style.display !== 'none' && style.visibility !== 'hidden'
				&& Number(style.opacity || 1) > 0 && rect.width > 0 && rect.height > 0;
		};
		const sample = element => ({
			tag: element.tagName.toLowerCase(),
			id: element.id || '',
			className: String(element.className || '').slice(0, 120),
			text: String(element.textContent || '').trim().replace(/\\s+/g, ' ').slice(0, 120)
		});
		const scrollContained = element => {
			for (let parent = element.parentElement; parent && parent !== panel; parent = parent.parentElement) {
				const overflow = getComputedStyle(parent).overflowX;
				if (overflow === 'auto' || overflow === 'scroll') return true;
			}
			return false;
		};
		const descendants = panel ? [panel, ...panel.querySelectorAll('*')].filter(visible) : [];
		const escaped = descendants.filter(element => {
			const rect = element.getBoundingClientRect();
			return !scrollContained(element) && (rect.left < -1 || rect.right > innerWidth + 1);
		}).slice(0, 6).map(sample);
		const invisibleText = descendants.filter(element => {
			if (element.childElementCount || !element.textContent.trim()) return false;
			const style = getComputedStyle(element);
			const alphaZero = style.color === 'transparent' || /rgba\\([^)]*,\\s*0\\s*\\)/.test(style.color);
			return alphaZero || parseFloat(style.fontSize) <= 0;
		}).slice(0, 6).map(sample);
		const generic = new Set(['DIV', 'SECTION', 'ARTICLE', 'LI']);
		const looseText = descendants.filter(element => {
			if (!generic.has(element.tagName) || element.id || element.className) return false;
			return [...element.childNodes].some(node => node.nodeType === Node.TEXT_NODE && node.textContent.trim());
		}).slice(0, 6).map(sample);
		const controls = panel ? [...panel.querySelectorAll('button,a[href],select,input:not([type="hidden"]),textarea')] : [];
		const undersizedControls = controls.filter(element => {
			if (!visible(element)) return false;
			const type = String(element.type || '').toLowerCase();
			if (['checkbox', 'radio', 'range', 'file', 'color'].includes(type)) return false;
			const style = getComputedStyle(element);
			if (element.tagName === 'A' && style.display === 'inline') return false;
			const rect = element.getBoundingClientRect();
			return rect.width < 24 || rect.height < 24;
		}).slice(0, 6).map(sample);
		const rect = panel?.getBoundingClientRect() || { width: 0, height: 0 };
		return {
			routeId: '${routeId}',
			panelActive: Boolean(panel && !panel.hidden && panel.dataset.active === 'true'),
			panelWidth: rect.width,
			panelHeight: rect.height,
			documentOverflow: Math.max(0, document.documentElement.scrollWidth - innerWidth),
			escaped,
			invisibleText,
			looseText,
			undersizedControls
		};
	})()`);
}
