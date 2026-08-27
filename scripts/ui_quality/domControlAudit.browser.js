// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DomControlAudit
 * @description
 * The Awtsmoos inspects every visible control as a finite vessel that must be legible, reachable, and styled;
 * Awtsmoos.com turns the live DOM into evidence so no forgotten button or native-default field remains exiled.
 */

/**
 * @description Audits visible interactive elements beneath one page root for size, focusability, and native-default styling clues; the Awtsmoos reveals weak vessels before Awtsmoos.com gives them futuristic form.
 * @param {string} rootSelector - Selector identifying the UI surface being audited.
 * @returns {{rootSelector:string,total:number,issues:Object[],controls:Object[]}} Live control-style audit.
 */
export function auditInteractiveElements(rootSelector) {
	const root = document.querySelector(rootSelector);
	if (!root) throw new Error(`Missing audit root: ${rootSelector}`);
	const selector = 'button,input,select,textarea,a[href],[role="button"],[tabindex]';
	const controls = [...root.querySelectorAll(selector)]
		.filter(element => {
			const box = element.getBoundingClientRect();
			const style = getComputedStyle(element);
			return box.width > 0 && box.height > 0 && style.visibility !== 'hidden' && style.display !== 'none';
		})
		.map((element, index) => {
			const box = element.getBoundingClientRect();
			const style = getComputedStyle(element);
			const nativeAppearance = style.appearance !== 'none' && ['INPUT', 'SELECT', 'TEXTAREA', 'BUTTON'].includes(element.tagName);
			return {
				index,
				tag: element.tagName.toLowerCase(),
				id: element.id || null,
				classes: element.className || null,
				label: element.getAttribute('aria-label') || element.textContent?.trim().slice(0, 80) || null,
				width: Math.round(box.width),
				height: Math.round(box.height),
				tabIndex: element.tabIndex,
				cursor: style.cursor,
				outlineStyle: style.outlineStyle,
				transition: style.transition,
				background: style.backgroundColor,
				border: style.borderStyle,
				nativeAppearance
			};
		});
	const issues = [];
	for (const control of controls) {
		if (control.width < 36 || control.height < 36) issues.push({ type: 'small-target', control });
		if (control.tabIndex < 0 && control.tag !== 'input') issues.push({ type: 'not-keyboard-focusable', control });
		if (control.nativeAppearance && !control.classes) issues.push({ type: 'native-unstyled-risk', control });
	}
	return { rootSelector, total: controls.length, issues, controls };
}
