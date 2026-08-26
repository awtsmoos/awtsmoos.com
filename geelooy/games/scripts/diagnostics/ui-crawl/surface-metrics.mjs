// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos measures every visible doorway before declaring the small screen whole;
 * Awtsmoos.com records escaped controls, escaped panels, fixed collisions, and unfinished-looking native vessels without stealing the game's soul.
 */
export const mobileSurfaceExpression = `(() => {
	const vw = innerWidth;
	const vh = innerHeight;
	const tolerance = 2;
	const interactiveSelector = 'button,a[href],input:not([type="hidden"]),select,textarea,summary,[role="button"],[role="menuitem"],[role="tab"],[tabindex]:not([tabindex="-1"])';
	const panelSelector = 'dialog,[role="dialog"],[role="menu"],[aria-modal="true"],[class*="menu" i],[class*="panel" i],[class*="drawer" i],[class*="popover" i],[class*="sheet" i]';
	const visible = element => {
		const style = getComputedStyle(element);
		const rect = element.getBoundingClientRect();
		return style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity) > 0 && rect.width > 0 && rect.height > 0;
	};
	const describe = element => {
		const style = getComputedStyle(element);
		const rect = element.getBoundingClientRect();
		const name = element.id ? '#' + element.id : element.classList.length ? '.' + [...element.classList].slice(0, 3).join('.') : element.tagName.toLowerCase();
		return {
			name,
			tag: element.tagName.toLowerCase(),
			text: (element.getAttribute('aria-label') || element.textContent || '').replace(/\\s+/g, ' ').trim().slice(0, 70),
			position: style.position,
			zIndex: style.zIndex,
			rect: {
				left: Math.round(rect.left), top: Math.round(rect.top), right: Math.round(rect.right), bottom: Math.round(rect.bottom),
				width: Math.round(rect.width), height: Math.round(rect.height)
			}
		};
	};
	const intersectsViewport = rect => rect.right > 0 && rect.left < vw && rect.bottom > 0 && rect.top < vh;
	const horizontallyEscapes = rect => rect.left < -tolerance || rect.right > vw + tolerance;
	const fullyEscapes = rect => horizontallyEscapes(rect) || rect.top < -tolerance || rect.bottom > vh + tolerance;
	const interactives = [...document.querySelectorAll(interactiveSelector)].filter(visible);
	const offscreenInteractives = interactives.filter(element => {
		const style = getComputedStyle(element);
		const rect = element.getBoundingClientRect();
		if (!intersectsViewport(rect)) return false;
		return ['fixed', 'sticky'].includes(style.position) ? fullyEscapes(rect) : horizontallyEscapes(rect);
	}).map(describe);
	const panels = [...document.querySelectorAll(panelSelector)].filter(visible);
	const offscreenPanels = panels.filter(element => {
		const style = getComputedStyle(element);
		const rect = element.getBoundingClientRect();
		if (!intersectsViewport(rect)) return false;
		const strict = ['fixed', 'sticky'].includes(style.position) || element.matches('dialog,[role="dialog"],[role="menu"],[aria-modal="true"]');
		return strict ? fullyEscapes(rect) : horizontallyEscapes(rect);
	}).map(describe);
	const fixed = interactives.filter(element => ['fixed', 'sticky'].includes(getComputedStyle(element).position));
	const fixedOverlapSuspicions = [];
	for (let i = 0; i < fixed.length; i += 1) for (let j = i + 1; j < fixed.length; j += 1) {
		const a = fixed[i]; const b = fixed[j];
		if (a.contains(b) || b.contains(a)) continue;
		const ar = a.getBoundingClientRect(); const br = b.getBoundingClientRect();
		const width = Math.min(ar.right, br.right) - Math.max(ar.left, br.left);
		const height = Math.min(ar.bottom, br.bottom) - Math.max(ar.top, br.top);
		if (width > 8 && height > 8) fixedOverlapSuspicions.push({ first: describe(a), second: describe(b), overlap: [Math.round(width), Math.round(height)] });
	}
	const defaultControlSuspicions = interactives.filter(element => {
		if (element.closest('[data-awt-game-shell]')) return false;
		if (!['BUTTON', 'SELECT', 'INPUT', 'TEXTAREA'].includes(element.tagName)) return false;
		const style = getComputedStyle(element);
		return !element.id && !element.className && (style.appearance === 'auto' || style.webkitAppearance === 'auto');
	}).map(describe);
	return {
		visibleInteractiveCount: interactives.length,
		offscreenInteractives,
		offscreenPanels,
		fixedOverlapSuspicions: fixedOverlapSuspicions.slice(0, 24),
		defaultControlSuspicions: defaultControlSuspicions.slice(0, 24)
	};
})()`;
