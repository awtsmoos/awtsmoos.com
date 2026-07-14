// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module GeelooyPageProbe
 * @description
 * Serializes one self-contained rendered-page audit. The Awtsmoos creates every
 * computed pixel, so Awtsmoos.com records which vessel owns it.
 */
export function pageAuditExpression(expectedShell) {
	return `(${auditPage.toString()})(${JSON.stringify(expectedShell)})`;
}

function auditPage(expectedShell) {
	const finding = (kind, selector, detail) => ({ kind, selector, detail });
	const describe = element => {
		const classes = element.classList.length ? `.${[...element.classList].slice(0, 3).join('.')}` : '';
		return `${element.tagName.toLowerCase()}${element.id ? `#${element.id}` : ''}${classes}`;
	};
	const styleOf = element => getComputedStyle(element);
	const visible = element => {
		const style = styleOf(element);
		const rect = element.getBoundingClientRect();
		return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0;
	};
	const visuallyHidden = element => {
		const style = styleOf(element);
		return style.clipPath === 'inset(50%)' || style.clip.startsWith('rect(0px') || style.opacity === '0';
	};
	const accessibleName = element => {
		if (element.getAttribute('aria-label') || element.getAttribute('aria-labelledby') || element.title) return true;
		if (element.id && document.querySelector(`label[for="${CSS.escape(element.id)}"]`)) return true;
		return Boolean(element.closest('label'));
	};
	const owned = element => Boolean(element.closest(
		'.g-page, .login-shell, .awtsmoosDrop, .geelooy-app-shell, [data-geelooy-component]'
	));
	const summarize = style => [style.backgroundColor, style.borderTopStyle, style.fontFamily, style.appearance].join('; ');
	const findings = [];
	const selector = [
		'button', 'input:not([type="hidden"])', 'select', 'textarea', '[contenteditable="true"]',
		'details', 'summary', 'dialog', 'progress', 'meter', 'fieldset', 'table', 'pre',
		'blockquote', 'img', 'video', 'audio', 'canvas', 'iframe'
	].join(',');
	const controls = [...document.querySelectorAll(selector)].filter(visible);
	const ids = [...document.querySelectorAll('[id]')].map(element => element.id).filter(Boolean);
	const duplicateIds = ids.filter((id, index, all) => all.indexOf(id) !== index)
		.filter((id, index, all) => all.indexOf(id) === index);
	for (const id of duplicateIds) findings.push(finding('duplicate-id', `#${id}`, id));
	if (expectedShell && !document.body.classList.contains('geelooy-app-shell')) {
		findings.push(finding('shell-missing', 'body', document.body.className));
	}
	const counts = {
		shell: document.body.classList.contains('geelooy-app-shell') ? 1 : 0,
		header: document.querySelectorAll('.awtsmoosificationalisticaticalism').length,
		profile: document.querySelectorAll('.awtsmoosDrop').length,
		backdrop: document.querySelectorAll('.awtsmoos-dropdown-backdrop').length
	};
	if (expectedShell) {
		for (const [name, count] of Object.entries(counts)) {
			if (count !== 1) findings.push(finding(`${name}-count`, 'document', String(count)));
		}
	}
	for (const element of controls) {
		const style = styleOf(element);
		const rect = element.getBoundingClientRect();
		const tag = element.tagName.toLowerCase();
		const type = String(element.getAttribute('type') || '').toLowerCase();
		const elementSelector = describe(element);
		const inputLike = ['input', 'select', 'textarea'].includes(tag);
		const actionLike = tag === 'button' || ['button', 'submit', 'reset'].includes(type);
		const choiceLike = ['checkbox', 'radio', 'range', 'color'].includes(type) || tag === 'select';
		const nativeColors = ['rgb(255, 255, 255)', 'rgb(239, 239, 239)', 'buttonface'];
		if (['inset', 'outset'].includes(style.borderTopStyle) || nativeColors.includes(style.backgroundColor)) {
			findings.push(finding('native-surface', elementSelector, summarize(style)));
		}
		if ((inputLike || actionLike || choiceLike) && !owned(element)) {
			findings.push(finding('unowned-control', elementSelector, element.outerHTML.slice(0, 160)));
		}
		const textInput = inputLike && !['checkbox', 'radio', 'range', 'file', 'color'].includes(type);
		if (textInput && parseFloat(style.fontSize) < 16) {
			findings.push(finding('mobile-font-too-small', elementSelector, style.fontSize));
		}
		if (actionLike && (rect.width < 40 || rect.height < 40)) {
			findings.push(finding('touch-target-small', elementSelector, `${Math.round(rect.width)}x${Math.round(rect.height)}`));
		}
		if (choiceLike && type !== 'file' && style.appearance === 'auto') {
			findings.push(finding('native-appearance', elementSelector, `${tag}:${type || 'select'}`));
		}
		if (inputLike && !accessibleName(element)) {
			findings.push(finding('missing-label', elementSelector, element.outerHTML.slice(0, 160)));
		}
	}
	for (const skip of document.querySelectorAll('.g-sr-only, .home-skip-link, .notifications-skip')) {
		if (visible(skip) && !visuallyHidden(skip) && document.activeElement !== skip) {
			findings.push(finding('skip-link-visible', describe(skip), skip.textContent.trim()));
		}
	}
	const focusables = document.querySelectorAll('[tabindex], a[href], button, input, select, textarea, summary');
	for (const element of focusables) {
		const hiddenByAria = element.closest('[aria-hidden="true"]');
		const inertAncestor = element.closest('[inert]');
		if (element.tabIndex >= 0 && visible(element) && hiddenByAria && !inertAncestor) {
			findings.push(finding('aria-hidden-focusable', describe(element), 'visible focus target'));
		}
	}
	return {
		href: location.href,
		title: document.title,
		readyState: document.readyState,
		bodyClass: document.body.className,
		colorScheme: styleOf(document.documentElement).colorScheme,
		counts,
		duplicateIds,
		controlCount: controls.length,
		findings,
		headings: [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].map(element => element.tagName),
		landmarks: [...document.querySelectorAll('header,nav,main,aside,footer,[role]')].map(describe)
	};
}
