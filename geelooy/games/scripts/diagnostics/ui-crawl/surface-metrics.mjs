// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos measures each visible doorway before declaring the small screen whole;
 * Awtsmoos.com follows concealment through every ancestor and hears the real label that names each finite control.
 */
export const mobileSurfaceExpression = `(() => {
	const vw = innerWidth;
	const vh = innerHeight;
	const tolerance = 2;
	const interactiveSelector = 'button,a[href],input:not([type="hidden"]),select,textarea,summary,[role="button"],[role="menuitem"],[role="tab"],[tabindex]:not([tabindex="-1"])';
	const panelSelector = 'dialog,[role="dialog"],[role="menu"],[aria-modal="true"],[class*="menu" i],[class*="panel" i],[class*="drawer" i],[class*="popover" i],[class*="sheet" i]';
	const visible = element => {
		for (let node = element; node instanceof Element; node = node.parentElement) {
			const style = getComputedStyle(node);
			if (node.hidden || style.display === 'none' || ['hidden', 'collapse'].includes(style.visibility) || Number(style.opacity) <= 0) return false;
		}
		const rect = element.getBoundingClientRect();
		return rect.width > 0 && rect.height > 0;
	};
	const accessibleName = element => {
		const labelledBy = element.getAttribute('aria-labelledby');
		const labelledText = labelledBy ? labelledBy.split(/\\s+/).map(id => document.getElementById(id)?.textContent || '').join(' ') : '';
		const labelText = [...(element.labels || [])].map(label => label.textContent || '').join(' ');
		const valueName = element.matches('input[type="button"],input[type="submit"],input[type="reset"]') ? element.value : '';
		return (element.getAttribute('aria-label') || labelledText || labelText || element.getAttribute('title') || element.getAttribute('alt') || valueName || element.textContent || '').replace(/\\s+/g, ' ').trim();
	};
	const effectiveTarget = element => {
		if (element.matches('input[type="checkbox"],input[type="radio"]')) {
			const label = element.closest('label') || element.labels?.[0];
			if (label && visible(label)) return label;
		}
		return element;
	};
	const describe = element => {
		const rect = effectiveTarget(element).getBoundingClientRect();
		const style = getComputedStyle(element);
		const name = element.id ? '#' + element.id : element.classList.length ? '.' + [...element.classList].slice(0, 3).join('.') : element.tagName.toLowerCase();
		return { name, tag: element.tagName.toLowerCase(), text: accessibleName(element).slice(0, 70), position: style.position, zIndex: style.zIndex,
			rect: { left: Math.round(rect.left), top: Math.round(rect.top), right: Math.round(rect.right), bottom: Math.round(rect.bottom), width: Math.round(rect.width), height: Math.round(rect.height) } };
	};
	const intersectsViewport = rect => rect.right > 0 && rect.left < vw && rect.bottom > 0 && rect.top < vh;
	const horizontallyEscapes = rect => rect.left < -tolerance || rect.right > vw + tolerance;
	const fullyEscapes = rect => horizontallyEscapes(rect) || rect.top < -tolerance || rect.bottom > vh + tolerance;
	const interactives = [...document.querySelectorAll(interactiveSelector)].filter(visible);
	const gameInteractives = interactives.filter(element => !element.closest('[data-awt-game-shell]'));
	const offscreenInteractives = gameInteractives.filter(element => {
		const rect = effectiveTarget(element).getBoundingClientRect();
		if (!intersectsViewport(rect)) return false;
		return ['fixed', 'sticky'].includes(getComputedStyle(element).position) ? fullyEscapes(rect) : horizontallyEscapes(rect);
	}).map(describe);
	const panels = [...document.querySelectorAll(panelSelector)].filter(visible);
	const offscreenPanels = panels.filter(element => {
		const style = getComputedStyle(element);
		const rect = element.getBoundingClientRect();
		if (!intersectsViewport(rect)) return false;
		const strict = ['fixed', 'sticky'].includes(style.position) || element.matches('dialog,[role="dialog"],[role="menu"],[aria-modal="true"]');
		return strict ? fullyEscapes(rect) : horizontallyEscapes(rect);
	}).map(describe);
	const fixed = gameInteractives.filter(element => ['fixed', 'sticky'].includes(getComputedStyle(element).position));
	const fixedOverlapSuspicions = [];
	for (let i = 0; i < fixed.length; i += 1) for (let j = i + 1; j < fixed.length; j += 1) {
		const a = fixed[i]; const b = fixed[j];
		if (a.contains(b) || b.contains(a)) continue;
		const ar = a.getBoundingClientRect(); const br = b.getBoundingClientRect();
		const width = Math.min(ar.right, br.right) - Math.max(ar.left, br.left);
		const height = Math.min(ar.bottom, br.bottom) - Math.max(ar.top, br.top);
		if (width > 8 && height > 8) fixedOverlapSuspicions.push({ first: describe(a), second: describe(b), overlap: [Math.round(width), Math.round(height)] });
	}
	const controlLike = element => element.matches('button,input,select,textarea,summary,[role="button"],[role="menuitem"],[role="tab"]');
	const smallTouchTargets = gameInteractives.filter(element => {
		if (!controlLike(element)) return false;
		const rect = effectiveTarget(element).getBoundingClientRect();
		return rect.width < 43.5 || rect.height < 43.5;
	}).map(describe);
	const unlabeledControls = gameInteractives.filter(element => controlLike(element) && !accessibleName(element)).map(describe);
	const defaultControlSuspicions = gameInteractives.filter(element => {
		if (!['BUTTON', 'SELECT', 'INPUT', 'TEXTAREA'].includes(element.tagName)) return false;
		const style = getComputedStyle(element);
		return !element.id && !element.className && (style.appearance === 'auto' || style.webkitAppearance === 'auto');
	}).map(describe);
	let reducedMotionRuleCount = 0;
	for (const sheet of [...document.styleSheets]) try {
		for (const rule of [...sheet.cssRules]) if (String(rule.conditionText || '').includes('prefers-reduced-motion')) reducedMotionRuleCount += 1;
	} catch {}
	return { visibleInteractiveCount: gameInteractives.length, offscreenInteractives, offscreenPanels,
		fixedOverlapSuspicions: fixedOverlapSuspicions.slice(0, 24), defaultControlSuspicions: defaultControlSuspicions.slice(0, 24),
		smallTouchTargets: smallTouchTargets.slice(0, 32), unlabeledControls: unlabeledControls.slice(0, 32), reducedMotionRuleCount };
})()`;
